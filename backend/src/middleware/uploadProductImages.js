const multer = require('multer');
const env = require('../config/env');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'images'));
    return;
  }
  cb(null, true);
}

// Buffered in memory, then uploaded to S3 by the controller — see
// backend/src/services/storageService.js.
const uploadProductImages = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: env.maxUploadSizeBytes, files: 10 },
});

module.exports = uploadProductImages;
