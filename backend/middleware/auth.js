const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const BEARER_PREFIX = 'Bearer ';

const BEARER_PREFIX = 'Bearer ';

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Not authorized, token invalid');
  }
};