const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const PRODUCT_FIELDS = ['name', 'description', 'price', 'category', 'image', 'stock'];
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

const pickFields = (body) =>
  PRODUCT_FIELDS.reduce((result, key) => {
    if (body[key] !== undefined) {
      result[key] = body[key];
    }
    return result;
  }, {});
  
  const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');