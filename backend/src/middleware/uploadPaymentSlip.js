const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'paymentSlip'));
    return;
  }
  cb(null, true);
}

const uploadPaymentSlip = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadSizeBytes },
});

module.exports = uploadPaymentSlip;
