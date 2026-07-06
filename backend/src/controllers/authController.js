const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

function signToken(admin, rememberMe) {
  return jwt.sign({ id: admin._id, role: admin.role }, env.jwtSecret, {
    expiresIn: rememberMe ? env.jwtRememberMeExpiresIn : env.jwtExpiresIn,
  });
}

const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(admin, Boolean(rememberMe));

  res.json({
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

const me = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id);
  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }
  res.json({ admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
});

module.exports = { login, me };
