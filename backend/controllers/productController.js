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

  const parsePositiveInt = (value, fallback) => {
  const number = parseInt(value, 10);
  return Number.isNaN(number) || number < 1 ? fallback : number;
};

const parsePrice = (value, name) => {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    throw httpError(400, `${name} must be a number of 0 or more`);
  }
  return price;
};

const buildProductFilter = ({ keyword, category, minPrice, maxPrice }) => {
  const filter = {};

  if (keyword) {
    filter.name = { $regex: escapeRegex(String(keyword)), $options: 'i' };
  }
  if (category) {
    filter.category = String(category);
  }

  const price = {};
  if (minPrice) {
    price.$gte = parsePrice(minPrice, 'minPrice');
  }
  if (maxPrice) {
    price.$lte = parsePrice(maxPrice, 'maxPrice');
  }
  if (Object.keys(price).length > 0) {
    filter.price = price;
  }

  return filter;
};
const getProducts = asyncHandler(async (req, res) => {
  const filter = buildProductFilter(req.query);
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  res.json({ products, page, pages: Math.ceil(total / limit), total });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories.sort());
});