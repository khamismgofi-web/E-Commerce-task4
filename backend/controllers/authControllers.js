const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const DEFAULT_TOKEN_LIFETIME = '7d';

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

const normalizeEmail = (email) => email.trim().toLowerCase();

const signToken = (id) =>
  jwt.sign({ id: String(id) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_TOKEN_LIFETIME,
  });

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: signToken(user._id),
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (![name, email, password].every(isNonEmptyString)) {
    throw httpError(400, 'Name, email and password are required');
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw httpError(409, 'Email is already registered');
  }

  const user = await User.create({ name, email: normalizedEmail, password });
  res.status(201).json(userResponse(user));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw httpError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw httpError(401, 'Invalid email or password');
  }

  res.json(userResponse(user));
});

const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { register, login, getMe };