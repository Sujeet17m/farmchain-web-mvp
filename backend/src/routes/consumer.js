const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');

// Public routes (no auth required for consumers)
router.get('/track/:batchId', consumerController.trackProduct);
router.get('/search', consumerController.searchProducts);
router.get('/featured', consumerController.getFeaturedProducts);
router.get('/categories', consumerController.getCategories);

module.exports = router;