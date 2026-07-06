const multer = require('multer');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_UNEXPECTED_FILE'
        ? 'Payment slip must be a JPG, PNG, or PDF file'
        : err.code === 'LIMIT_FILE_SIZE'
        ? `Payment slip exceeds the maximum allowed size`
        : err.message;
    return res.status(400).json({ message });
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({ message: 'Validation failed', details: err.errors });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${err.path}` });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with these details already exists' });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  console.error(err);
  return res.status(500).json({
    message: env.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
}

module.exports = errorHandler;
