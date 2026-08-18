const { Product, Category, Review, sequelize } = require('../../models');
const { Op } = require('sequelize');
const LLMService = require('../services/llmService');

class SearchController {
  /**
   * POST /search/nlp
   * Natural Language search using LLM filter extraction
   */
  static async searchNLP(req, res) {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le champ query est requis.'
        });
      }

      // 1. Fetch categories and unique tags from database to inject into system prompt
      const categories = await Category.findAll({ attributes: ['id', 'name'], raw: true });
      
      const allProducts = await Product.findAll({ attributes: ['tags'], where: { isActive: true }, raw: true });
      const uniqueTags = Array.from(new Set(allProducts.flatMap(p => p.tags || [])));

      // 2. Call LLM Service to parse filters
      const filters = await LLMService.extractFiltersFromQuery(query, categories, uniqueTags);
      console.log('Parsed NLP Filters:', filters);

      // 3. Build Sequelize query conditions
      const whereCondition = { isActive: true };

      // Resolve categoryId if category name is matched
      if (filters.category) {
        const matchedCategory = categories.find(
          c => c.name.toLowerCase() === filters.category.toLowerCase()
        );
        if (matchedCategory) {
          whereCondition.categoryId = matchedCategory.id;
        }
      }

      // Resolve price range
      const priceCond = {};
      if (filters.min_price !== null && filters.min_price !== undefined && !isNaN(filters.min_price)) {
        priceCond[Op.gte] = parseFloat(filters.min_price);
      }
      if (filters.max_price !== null && filters.max_price !== undefined && !isNaN(filters.max_price)) {
        priceCond[Op.lte] = parseFloat(filters.max_price);
      }
      if (Object.keys(priceCond).length > 0) {
        whereCondition.price = priceCond;
      }

      // Resolve tags
      if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
        const escapedTags = filters.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',');
        whereCondition[Op.and] = sequelize.literal(
          `"Product"."tags" && ARRAY[${escapedTags}]::varchar[]`
        );
      }

      // 4. Query products
      const products = await Product.findAll({
        where: whereCondition,
        order: [['ratingAvg', 'DESC']],
        raw: true
      });

      // Format price & rating
      const formattedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        tags: p.tags,
        images: p.images,
        ratingAvg: parseFloat(p.ratingAvg),
        ratingCount: parseInt(p.ratingCount, 10),
        categoryId: p.categoryId
      }));

      return res.status(200).json({
        success: true,
        filters: {
          category: filters.category,
          minPrice: filters.min_price,
          maxPrice: filters.max_price,
          tags: filters.tags
        },
        data: formattedProducts
      });
    } catch (error) {
      console.error('NLP search error, falling back to classic search:', error);
      // Fallback: use classic search logic
      try {
        const queryText = req.body.query;
        const products = await Product.findAll({
          where: {
            isActive: true,
            [Op.or]: [
              { name: { [Op.iLike]: `%${queryText}%` } },
              { description: { [Op.iLike]: `%${queryText}%` } }
            ]
          },
          order: [['ratingAvg', 'DESC']],
          raw: true
        });

        const formattedProducts = products.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: parseFloat(p.price),
          tags: p.tags,
          images: p.images,
          ratingAvg: parseFloat(p.ratingAvg),
          ratingCount: parseInt(p.ratingCount, 10),
          categoryId: p.categoryId
        }));

        return res.status(200).json({
          success: true,
          fallback: true,
          message: 'Recherche classique effectuée par repli.',
          filters: null,
          data: formattedProducts
        });
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        return res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur lors de la recherche.',
          error: fallbackError.message
        });
      }
    }
  }

  /**
   * GET /search
   * Classic text search (fallback / keyword search)
   */
  static async searchClassic(req, res) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string' || q.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre de requête q est requis.'
        });
      }

      const products = await Product.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { description: { [Op.iLike]: `%${q}%` } }
          ]
        },
        order: [['ratingAvg', 'DESC']],
        raw: true
      });

      const formattedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        tags: p.tags,
        images: p.images,
        ratingAvg: parseFloat(p.ratingAvg),
        ratingCount: parseInt(p.ratingCount, 10),
        categoryId: p.categoryId
      }));

      return res.status(200).json({
        success: true,
        data: formattedProducts
      });
    } catch (error) {
      console.error('Classic search error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
        error: error.message
      });
    }
  }

  /**
   * GET /products/:id/review-summary
   * Fetches 20 last reviews and returns an AI generated pros/cons summary
   */
  static async getProductReviewSummary(req, res) {
    try {
      const { id: productId } = req.params;

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé.'
        });
      }

      // Fetch last 20 reviews for this product
      const reviews = await Review.findAll({
        where: { productId },
        order: [['created_at', 'DESC']],
        limit: 20,
        attributes: ['comment'],
        raw: true
      });

      const comments = reviews.map(r => r.comment).filter(c => !!c && c.trim() !== '');

      if (comments.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            pros: [],
            cons: [],
            rating_summary: "Aucun commentaire écrit n'est disponible pour ce produit."
          }
        });
      }

      // Generate summary
      const summary = await LLMService.summarizeReviews(comments);

      return res.status(200).json({
        success: true,
        data: {
          pros: summary.pros || [],
          cons: summary.cons || [],
          rating_summary: `Basé sur ${comments.length} avis récents.`
        }
      });
    } catch (error) {
      console.error('Error generating review summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du résumé d\'avis.',
        error: error.message
      });
    }
  }
}

module.exports = SearchController;
