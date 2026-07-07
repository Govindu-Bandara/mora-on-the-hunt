const multer = require('multer');
const env = require('../config/env');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'paymentSlip'));
    return;
  }
  cb(null, true);
}

// Buffered in memory, then uploaded to S3 by the controller — see
// backend/src/services/storageService.js. Files are small (slip images
// under MAX_UPLOAD_SIZE_MB) so buffering in memory is fine at this scale.
const uploadPaymentSlip = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: env.maxUploadSizeBytes },
});

module.exports = uploadPaymentSlip;
