const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

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

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderImages,
};
