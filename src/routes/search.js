const express = require('express');
const SearchController = require('../controllers/searchController');

const router = express.Router();

/**
 * Routes du module de Recherche NLP et Analyse d'Avis
 * 
 * Base URL: /search
 */

/**
 * @route   POST /search/nlp
 * @desc    Recherche intelligente en langage naturel avec filtres IA
 * @access  Public
 */
router.post('/nlp', SearchController.searchNLP);

/**
 * @route   GET /search
 * @desc    Recherche textuelle classique (fallback)
 * @access  Public
 */
router.get('/', SearchController.searchClassic);

/**
 * @route   GET /search/products/:id/review-summary
 * @desc    Obtenir le résumé IA (pros/cons) des avis clients pour un produit
 * @access  Public
 */
router.get('/products/:id/review-summary', SearchController.getProductReviewSummary);

module.exports = router;
