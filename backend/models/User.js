const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;