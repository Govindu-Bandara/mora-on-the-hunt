const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const storageService = require('../services/storageService');

const listProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (!req.admin) filter.available = true;

  const products = await Product.find(filter).sort({ category: 1, sortOrder: 1 });
  res.json({ products });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.status(204).send();
});

const reorderImages = asyncHandler(async (req, res) => {
  const { images } = req.body;
  if (!Array.isArray(images)) throw new ApiError(400, 'images must be an array');
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { images },
    { returnDocument: 'after', runValidators: true }
  );
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ product });
});

const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'At least one image file is required');
  }

  const origin = `${req.protocol}://${req.get('host')}`;
  const uploads = await Promise.all(
    req.files.map(async (file) => {
      const key = await storageService.uploadFile(file.buffer, file.originalname, file.mimetype, 'products');
      return { key, url: `${origin}/api/products/image?key=${encodeURIComponent(key)}` };
    })
  );

  res.status(201).json({ images: uploads });
});

const EXT_MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const serveImage = asyncHandler(async (req, res) => {
  const { key } = req.query;
  if (typeof key !== 'string' || !key.startsWith('products/')) {
    throw new ApiError(400, 'Invalid image key');
  }

  let stream;
  try {
    stream = await storageService.getFileStream(key);
  } catch {
    throw new ApiError(404, 'Image not found');
  }

  const ext = key.slice(key.lastIndexOf('.')).toLowerCase();
  res.setHeader('Content-Type', EXT_MIME_TYPES[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  stream.pipe(res);
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderImages,
  uploadImages,
  serveImage,
};
