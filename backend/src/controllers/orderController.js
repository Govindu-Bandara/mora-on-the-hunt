const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateOrderId = require('../utils/generateOrderId');
const { calculateTotal } = require('../utils/pricingEngine');
const storageService = require('../services/storageService');

async function buildOrderItemsAndPricing(requestedItems, { requireAvailable }) {
  const productIds = requestedItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = requestedItems.map((item) => {
    const product = productMap.get(item.productId);
    if (!product || (requireAvailable && !product.available)) {
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

  return { orderItems, pricing: calculateTotal(shirtCount, bangleCount) };
}

const createOrder = asyncHandler(async (req, res) => {
  const { fullName, indexOrNic, telephone, batch, faculty, department } = req.body;
  const requestedItems = JSON.parse(req.body.items);

  if (!req.file) {
    throw new ApiError(400, 'Payment slip is required');
  }

  const { orderItems, pricing } = await buildOrderItemsAndPricing(requestedItems, {
    requireAvailable: true,
  });

  const orderId = await generateOrderId();
  const key = await storageService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

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
      key,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
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
  const { status, batch, faculty, distributed, search, page = 1, limit = 20, sort = '-createdAt' } =
    req.query;

  const filter = {};
  if (status) filter.status = status;
  if (batch) filter.batch = batch;
  if (faculty) filter.faculty = faculty;
  if (distributed === 'true' || distributed === 'false') {
    filter.distributed = distributed === 'true';
  }
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

const updateOrder = asyncHandler(async (req, res) => {
  const { fullName, indexOrNic, telephone, batch, faculty, department } = req.body;
  const requestedItems = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;

  const { orderItems, pricing } = await buildOrderItemsAndPricing(requestedItems, {
    requireAvailable: false,
  });

  const order = await Order.findOneAndUpdate(
    { orderId: req.params.orderId },
    {
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
    },
    { returnDocument: 'after', runValidators: true }
  );
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ order });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOneAndUpdate(
    { orderId: req.params.orderId },
    { status },
    { returnDocument: 'after', runValidators: true }
  );
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ order });
});

const updateDistributed = asyncHandler(async (req, res) => {
  const { distributed } = req.body;
  const order = await Order.findOneAndUpdate(
    { orderId: req.params.orderId },
    { distributed: Boolean(distributed), distributedAt: distributed ? new Date() : null },
    { returnDocument: 'after', runValidators: true }
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
    { returnDocument: 'after' }
  );
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ order });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndDelete({ orderId: req.params.orderId });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.paymentSlip?.key) {
    await storageService.deleteFile(order.paymentSlip.key).catch(() => {});
  }
  res.status(204).send();
});

const downloadPaymentSlip = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) throw new ApiError(404, 'Order not found');

  let stream;
  try {
    stream = await storageService.getFileStream(order.paymentSlip.key);
  } catch {
    throw new ApiError(404, 'Payment slip file not found in storage');
  }

  res.setHeader('Content-Type', order.paymentSlip.mimetype);
  stream.pipe(res);
});

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  updateOrder,
  updateStatus,
  updateDistributed,
  addNote,
  deleteOrder,
  downloadPaymentSlip,
};
