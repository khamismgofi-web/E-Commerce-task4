const express = require('express');
const {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);