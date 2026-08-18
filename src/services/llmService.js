const axios = require('axios');

class LLMService {
  /**
   * Helper to perform chat completions using either Groq or Claude API
   */
  static async chatCompletion(systemPrompt, userPrompt, responseFormatJson = false) {
    const groqKey = process.env.GROQ_API_KEY;
    const claudeKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (groqKey) {
      console.log('🤖 Utilizing Groq API for completion...');
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.1,
            ...(responseFormatJson && { response_format: { type: 'json_object' } })
          },
          {
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        return response.data.choices[0].message.content;
      } catch (err) {
        console.error('Groq API Error:', err.response?.data || err.message);
        throw err;
      }
    } else if (claudeKey) {
      console.log('🤖 Utilizing Claude API for completion...');
      try {
        const response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            system: systemPrompt,
            messages: [
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.1
          },
          {
            headers: {
              'x-api-key': claudeKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        return response.data.content[0].text;
      } catch (err) {
        console.error('Claude API Error:', err.response?.data || err.message);
        throw err;
      }
    } else {
      console.log('⚠️ No LLM API keys found. Operating in fallback/mock mode.');
      return null;
    }
  }

  /**
   * Extracts filters (category, min/max price, tags) from natural language query
   */
  static async extractFiltersFromQuery(query, categories, tagsList) {
    const systemPrompt = `Tu extrais des filtres de recherche e-commerce depuis une requête en langage naturel.
Tu dois retourner UNIQUEMENT un objet JSON valide, sans aucune explication ou texte supplémentaire.

Les catégories disponibles dans le catalogue sont : [${categories.map(c => `"${c.name}"`).join(', ')}].
Les tags disponibles sont : [${tagsList.join(', ')}].

Le format de sortie JSON attendu est :
{
  "category": "Nom exact de la catégorie ou null si non mentionné",
  "min_price": minimum_price_number_or_null,
  "max_price": maximum_price_number_or_null,
  "tags": ["tag1", "tag2"] // tableau vide si aucun tag en commun
}`;

    const userPrompt = `Requête de l'utilisateur : "${query}"`;

    try {
      const resultText = await this.chatCompletion(systemPrompt, userPrompt, true);
      if (resultText) {
        // Nettoyage regex pour extraire le JSON s'il y a du bruit
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (err) {
      console.error('LLM filter extraction failed, using heuristic fallback:', err.message);
    }

    // Heuristic fallback if LLM is unavailable or fails
    return this.fallbackQueryParser(query, categories, tagsList);
  }

  /**
   * Summarizes customer reviews into pros and cons list
   */
  static async summarizeReviews(reviews) {
    if (!reviews || reviews.length === 0) {
      return { pros: [], cons: [], rating_summary: "Aucun avis disponible pour ce produit." };
    }

    const systemPrompt = `Tu analyses des avis clients pour un produit e-commerce.
Génère un résumé structuré contenant exactement 3 points forts (pros) et 3 inconvénients (cons) sous forme de liste.
Tu dois retourner UNIQUEMENT un objet JSON valide, sans explication supplémentaire.

Format JSON attendu :
{
  "pros": ["Avantage 1", "Avantage 2", "Avantage 3"],
  "cons": ["Inconvénient 1", "Inconvénient 2", "Inconvénient 3"]
}`;

    const userPrompt = `Avis clients à résumer :\n${reviews.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

    try {
      const resultText = await this.chatCompletion(systemPrompt, userPrompt, true);
      if (resultText) {
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (err) {
      console.error('LLM review summarization failed, using fallback:', err.message);
    }

    // Fallback response
    return {
      pros: ["Bon rapport qualité/prix", "Conforme à la description", "Livraison rapide"],
      cons: ["Qualité des matériaux moyenne", "Notice peu claire", "Emballage abîmé"]
    };
  }

  /**
   * Simple heuristic parser as a fallback
   */
  static fallbackQueryParser(query, categories, tagsList) {
    const normalized = query.toLowerCase();
    const result = {
      category: null,
      min_price: null,
      max_price: null,
      tags: []
    };

    // Extract category
    for (const cat of categories) {
      if (normalized.includes(cat.name.toLowerCase())) {
        result.category = cat.name;
        break;
      }
    }
    // Specific aliases mapping
    if (!result.category) {
      if (normalized.includes('laptop') || normalized.includes('ordinateur') || normalized.includes('pc') || normalized.includes('macbook')) {
        result.category = 'Électronique';
      } else if (normalized.includes('tshirt') || normalized.includes('vêtement') || normalized.includes('coton')) {
        result.category = 'Vêtements';
      } else if (normalized.includes('livre') || normalized.includes('roman') || normalized.includes('lecture')) {
        result.category = 'Livres & Média';
      }
    }

    // Extract tags
    for (const tag of tagsList) {
      if (normalized.includes(tag.toLowerCase())) {
        result.tags.push(tag);
      }
    }

    // Extract prices
    // Ex: "moins de 500 euros", "max 500", "< 500"
    const maxPriceMatch = normalized.match(/(?:moins de|max|maximum|sous|inférieur à|[\<\=])\s*(\d+(?:[\.,]\d+)?)/);
    if (maxPriceMatch) {
      result.max_price = parseFloat(maxPriceMatch[1].replace(',', '.'));
    }

    // Ex: "plus de 100 euros", "min 100", "> 100"
    const minPriceMatch = normalized.match(/(?:plus de|min|minimum|sur|supérieur à|[\>\=])\s*(\d+(?:[\.,]\d+)?)/);
    if (minPriceMatch) {
      result.min_price = parseFloat(minPriceMatch[1].replace(',', '.'));
    }

    return result;
  }
}

module.exports = LLMService;
