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

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith(BEARER_PREFIX)) {
    throw httpError(401, 'Not authorized, token missing');
  }

  const decoded = verifyToken(header.slice(BEARER_PREFIX.length));
  const user = await User.findById(decoded.id);
  if (!user) {
    throw httpError(401, 'User no longer exists');
  }

  req.user = user;
  next();
});