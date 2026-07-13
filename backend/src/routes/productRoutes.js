const express = require('express');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderImages,
  uploadImages,
  serveImage,
} = require('../controllers/productController');
const { productValidator } = require('../validators/productValidator');
const validate = require('../validators/validate');
const { verifyJWT, optionalAuth } = require('../middleware/auth');
const uploadProductImages = require('../middleware/uploadProductImages');

const router = express.Router();

router.get('/', optionalAuth, listProducts);
router.get('/image', serveImage);
router.post('/upload-images', verifyJWT, uploadProductImages.array('images', 10), uploadImages);
router.get('/:id', getProduct);
router.post('/', verifyJWT, productValidator, validate, createProduct);
router.put('/:id', verifyJWT, productValidator, validate, updateProduct);
router.patch('/:id/images', verifyJWT, reorderImages);
router.delete('/:id', verifyJWT, deleteProduct);

module.exports = router;
