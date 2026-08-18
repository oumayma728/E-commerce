const { Product, Category, UserEvent, sequelize } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class RecommendationController {
  /**
   * POST /events/view
   * Body: { product_id }
   */
  static async logViewEvent(req, res) {
    try {
      const { product_id: productId } = req.body;
      const userId = req.user.id;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Le champ product_id est requis.'
        });
      }

      // Check if product exists
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé.'
        });
      }

      // Create event
      const event = await UserEvent.create({
        id: uuidv4(),
        userId,
        productId,
        eventType: 'view'
      });

      return res.status(201).json({
        success: true,
        message: 'Événement de consultation enregistré avec succès.',
        data: event
      });
    } catch (error) {
      console.error('Error logging view event:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
        error: error.message
      });
    }
  }

  /**
   * POST /events/purchase
   * Body: { product_ids: [...] }
   */
  static async logPurchaseEvent(req, res) {
    try {
      const { product_ids: productIds } = req.body;
      const userId = req.user.id;

      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Le champ product_ids doit être un tableau non vide.'
        });
      }

      // Verify all products exist
      const products = await Product.findAll({
        where: {
          id: productIds
        }
      });

      if (products.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Un ou plusieurs identifiants de produit sont invalides.'
        });
      }

      const events = [];
      // Use transaction to ensure all events are recorded
      await sequelize.transaction(async (t) => {
        for (const productId of productIds) {
          const event = await UserEvent.create({
            id: uuidv4(),
            userId,
            productId,
            eventType: 'purchase'
          }, { transaction: t });
          events.push(event);
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Événements d\'achat enregistrés avec succès.',
        data: events
      });
    } catch (error) {
      console.error('Error logging purchase event:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
        error: error.message
      });
    }
  }

  /**
   * GET /recommendations/similar/:product_id
   * Computes product similarity using raw SQL based on:
   * - Same category -> +3 points
   * - Common tags -> +2 points per tag
   * - Price within ±20% -> +1 point
   */
  static async getSimilarProducts(req, res) {
    try {
      const { product_id: productId } = req.params;

      // Find current product
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé.'
        });
      }

      const { categoryId, tags, price } = product;
      const minPrice = parseFloat(price) * 0.8;
      const maxPrice = parseFloat(price) * 1.2;

      // SQL similarity computation
      const similarProducts = await sequelize.query(`
        SELECT p.id, p.name, p.description, p.price, p.tags, p.images, p.rating_avg, p.rating_count, p.category_id AS "categoryId",
          (CASE WHEN p.category_id = :categoryId THEN 3 ELSE 0 END) +
          (CASE WHEN p.price BETWEEN :minPrice AND :maxPrice THEN 1 ELSE 0 END) +
          (COALESCE(
            (SELECT cardinality(array(
              SELECT * FROM unnest(p.tags) 
              INTERSECT 
              SELECT * FROM unnest(ARRAY[:tags]::varchar[])
            ))), 0) * 2
          ) AS similarity_score
        FROM products p
        WHERE p.id <> :productId AND p.is_active = true
        ORDER BY similarity_score DESC, p.rating_avg DESC
        LIMIT 4;
      `, {
        replacements: { productId, categoryId, minPrice, maxPrice, tags },
        type: QueryTypes.SELECT
      });

      // Format price & score values
      const formattedProducts = similarProducts.map(p => ({
        ...p,
        price: parseFloat(p.price),
        ratingAvg: parseFloat(p.rating_avg),
        ratingCount: parseInt(p.rating_count, 10),
        similarityScore: parseInt(p.similarity_score, 10)
      }));

      return res.status(200).json({
        success: true,
        data: formattedProducts
      });
    } catch (error) {
      console.error('Error computing similar products:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du calcul de similarité.',
        error: error.message
      });
    }
  }

  /**
   * GET /recommendations/trending
   * Trending products based on view count within last 7 days
   */
  static async getTrendingProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 4;

      // Query products based on number of views in the last 7 days
      const trendingProducts = await sequelize.query(`
        SELECT p.id, p.name, p.description, p.price, p.tags, p.images, p.rating_avg, p.rating_count, p.category_id AS "categoryId",
          COALESCE(event_counts.view_count, 0) AS view_count
        FROM products p
        INNER JOIN (
          SELECT product_id, COUNT(*) AS view_count
          FROM user_events
          WHERE event_type = 'view' AND created_at >= NOW() - INTERVAL '7 days'
          GROUP BY product_id
        ) event_counts ON p.id = event_counts.product_id
        WHERE p.is_active = true
        ORDER BY view_count DESC, p.rating_avg DESC
        LIMIT :limit;
      `, {
        replacements: { limit },
        type: QueryTypes.SELECT
      });

      // Fallback: if not enough views recorded this week, fill with top rated active products
      let finalProducts = [...trendingProducts];
      if (finalProducts.length < limit) {
        const excludeIds = finalProducts.map(p => p.id);
        const fallbackLimit = limit - finalProducts.length;

        const fallbackProducts = await Product.findAll({
          where: {
            isActive: true,
            ...(excludeIds.length > 0 && {
              id: {
                [Op.notIn]: excludeIds
              }
            })
          },
          order: [
            ['ratingAvg', 'DESC'],
            ['ratingCount', 'DESC']
          ],
          limit: fallbackLimit,
          raw: true
        });

        // Adapt mapping structure
        const mappedFallbacks = fallbackProducts.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: parseFloat(p.price),
          tags: p.tags,
          images: p.images,
          rating_avg: p.ratingAvg,
          rating_count: p.ratingCount,
          categoryId: p.categoryId,
          view_count: 0
        }));

        finalProducts = finalProducts.concat(mappedFallbacks);
      }

      // Format numbers
      const formattedProducts = finalProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        tags: p.tags,
        images: p.images,
        ratingAvg: parseFloat(p.rating_avg),
        ratingCount: parseInt(p.rating_count, 10),
        categoryId: p.categoryId,
        viewCount: parseInt(p.view_count || 0, 10)
      }));

      return res.status(200).json({
        success: true,
        data: formattedProducts
      });
    } catch (error) {
      console.error('Error fetching trending products:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des tendances.',
        error: error.message
      });
    }
  }

  /**
   * GET /recommendations/for-you
   * Personalized recommendations based on the categories of the user's last 5 events (views or purchases).
   * Excludes already purchased products and products currently in the user's cart.
   */
  static async getPersonalizedRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit, 10) || 4;

      const categoryRows = await sequelize.query(`
        SELECT p.category_id AS "categoryId"
        FROM user_events ue
        JOIN LATERAL unnest(
          CASE
            WHEN ue.product_ids IS NOT NULL THEN ue.product_ids
            WHEN ue.product_id IS NOT NULL THEN ARRAY[ue.product_id]
            ELSE ARRAY[]::uuid[]
          END
        ) AS event_product_id ON true
        JOIN products p ON p.id = event_product_id
        WHERE ue.user_id = :userId
          AND ue.event_type IN ('view', 'purchase')
        GROUP BY p.category_id
        ORDER BY MAX(ue.created_at) DESC
        LIMIT 5
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      });

      const categoryIds = categoryRows
        .map(row => row.categoryId)
        .filter(Boolean);

      // If user has no history, return top products as fallback
      if (categoryIds.length === 0) {
        console.log('No user activity history found. Reverting to trending fallback.');
        // We'll run a fallback logic at the end
      }

      // 2. Fetch user's cart items to exclude them
      // Query carts using raw SQL to bypass the missing Cart/CartItem sequelize models
      const cartItemsResult = await sequelize.query(`
        SELECT ci.product_id
        FROM cart_items ci
        INNER JOIN carts c ON ci.cart_id = c.id
        WHERE c.user_id = :userId
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      });
      const cartProductIds = cartItemsResult.map(item => item.product_id);

      // 3. Fetch user's purchased products to exclude them
      const purchaseEvents = await UserEvent.findAll({
        where: {
          userId,
          eventType: 'purchase'
        },
        attributes: ['productId', 'productIds'],
        raw: true
      });
      const purchasedProductIds = purchaseEvents.flatMap(pe => [
        pe.productId,
        ...(pe.productIds || [])
      ]).filter(Boolean);

      // Union of exclusions
      const excludeProductIds = Array.from(new Set([...cartProductIds, ...purchasedProductIds]));

      let recommendedProducts = [];

      if (categoryIds.length > 0) {
        // Find popular products in the extracted categories, sorted by ratingAvg DESC
        recommendedProducts = await Product.findAll({
          where: {
            isActive: true,
            categoryId: categoryIds,
            ...(excludeProductIds.length > 0 && {
              id: {
                [Op.notIn]: excludeProductIds
              }
            })
          },
          order: [
            ['ratingAvg', 'DESC'],
            ['ratingCount', 'DESC']
          ],
          limit,
          raw: true
        });
      }

      // Fallback: fill up or replace recommendations if count < limit
      if (recommendedProducts.length < limit) {
        const currentRecommendedIds = recommendedProducts.map(p => p.id);
        const finalExclusions = Array.from(new Set([...excludeProductIds, ...currentRecommendedIds]));
        const neededCount = limit - recommendedProducts.length;

        const fallbackProducts = await Product.findAll({
          where: {
            isActive: true,
            ...(finalExclusions.length > 0 && {
              id: {
                [Op.notIn]: finalExclusions
              }
            })
          },
          order: [
            ['ratingAvg', 'DESC'],
            ['ratingCount', 'DESC']
          ],
          limit: neededCount,
          raw: true
        });

        recommendedProducts = recommendedProducts.concat(fallbackProducts);
      }

      // Format response
      const formattedProducts = recommendedProducts.map(p => ({
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
      console.error('Error fetching personalized recommendations:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du calcul des recommandations personnalisées.',
        error: error.message
      });
    }
  }
}

module.exports = RecommendationController;
