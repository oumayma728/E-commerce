const express = require('express');
const RecommendationController = require('../controllers/Recommendationcontroller');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Routes du module de Recommandation et Tracking d'événements
 * 
 * Base URL: /recommendations
 */

/**
 * @route   GET /recommendations/similar/:product_id
 * @desc    Obtenir 4 produits similaires
 * @access  Public
 */
router.get('/similar/:product_id', RecommendationController.getSimilarProducts);

/**
 * @route   GET /recommendations/trending
 * @desc    Obtenir les produits les plus tendances
 * @access  Public
 */
router.get('/trending', RecommendationController.getTrendingProducts);

/**
 * @route   GET /recommendations/for-you
 * @desc    Obtenir les recommandations personnalisées basées sur l'historique
 * @access  Private
 */
router.get('/for-you', verifyToken, RecommendationController.getPersonalizedRecommendations);

module.exports = router;
