const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const verifyJWT = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.admin = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.admin || !roles.includes(req.admin.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  };
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.admin = { id: payload.id, role: payload.role };
  } catch {
    // invalid/expired token on an optional route: treat as anonymous
  }
  next();
}

module.exports = { verifyJWT, requireRole, optionalAuth };
