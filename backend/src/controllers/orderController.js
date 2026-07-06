const fs = require('fs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateOrderId = require('../utils/generateOrderId');
const { calculateTotal } = require('../utils/pricingEngine');

const createOrder = asyncHandler(async (req, res) => {
  const { fullName, indexOrNic, telephone, batch, faculty, department } = req.body;
  const requestedItems = JSON.parse(req.body.items);

  if (!req.file) {
    throw new ApiError(400, 'Payment slip is required');
  }

  const productIds = requestedItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = requestedItems.map((item) => {
    const product = productMap.get(item.productId);
    if (!product || !product.available) {
      throw new ApiError(400, `Product ${item.productId} is not available`);
    }
    if (product.category === 'tshirt' && !item.size) {
      throw new ApiError(400, `Size is required for ${product.name}`);
    }
    return {
      product: product._id,
      name: product.name,
      category: product.category,
      color: product.color,
      size: product.category === 'tshirt' ? item.size : null,
      quantity: item.quantity,
      unitPrice: product.currentPrice,
    };
  });

  const shirtCount = orderItems
    .filter((i) => i.category === 'tshirt')
    .reduce((sum, i) => sum + i.quantity, 0);
  const bangleCount = orderItems
    .filter((i) => i.category === 'bangle')
    .reduce((sum, i) => sum + i.quantity, 0);

  const pricing = calculateTotal(shirtCount, bangleCount);
  const orderId = await generateOrderId();

  const order = await Order.create({
    orderId,
    fullName,
    indexOrNic,
    telephone,
    batch,
    faculty,
    department,
    items: orderItems,
    bundleCount: pricing.bundleCount,
    bundleSavings: pricing.bundleSavings,
    subtotal: pricing.subtotal,
    discount: pricing.bundleSavings,
    finalTotal: pricing.finalTotal,
    paymentSlip: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
      size: req.file.size,
    },
  });

  res.status(201).json({
    orderId: order.orderId,
    finalTotal: order.finalTotal,
    bundleSavings: order.bundleSavings,
  });
});

const listOrders = asyncHandler(async (req, res) => {
  const { status, batch, faculty, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (batch) filter.batch = batch;
  if (faculty) filter.faculty = faculty;
  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ order });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOneAndUpdate(
    { orderId: req.params.orderId },
    { status },
    { new: true, runValidators: true }
  );
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ order });
});

const addNote = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) throw new ApiError(400, 'Note text is required');

  const order = await Order.findOneAndUpdate(
    { orderId: req.params.orderId },
    { $push: { notes: { text: text.trim(), createdBy: req.admin.id } } },
    { new: true }
  );
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ order });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndDelete({ orderId: req.params.orderId });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.paymentSlip?.path && fs.existsSync(order.paymentSlip.path)) {
    fs.unlink(order.paymentSlip.path, () => {});
  }
  res.status(204).send();
});

const downloadPaymentSlip = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) throw new ApiError(404, 'Order not found');
  if (!fs.existsSync(order.paymentSlip.path)) {
    throw new ApiError(404, 'Payment slip file not found on server');
  }
  res.setHeader('Content-Type', order.paymentSlip.mimetype);
  res.sendFile(order.paymentSlip.path);
});

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  updateStatus,
  addNote,
  deleteOrder,
  downloadPaymentSlip,
};
