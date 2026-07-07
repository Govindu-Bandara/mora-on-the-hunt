const Admin = require('../models/Admin');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const getAnalytics = asyncHandler(async (req, res) => {
  const todayStart = startOfToday();

  const [
    totals,
    todayTotals,
    colorAgg,
    sizeAgg,
    batchAgg,
    facultyAgg,
    departmentAgg,
    recentOrders,
  ] = await Promise.all([
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$finalTotal' },
          totalBundles: { $sum: '$bundleCount' },
        },
      },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart } } },
      { $group: { _id: null, ordersToday: { $sum: 1 }, revenueToday: { $sum: '$finalTotal' } } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.category': 'tshirt' } },
      { $group: { _id: '$items.color', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.category': 'tshirt', 'items.size': { $ne: null } } },
      { $group: { _id: '$items.size', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([{ $group: { _id: '$batch', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Order.aggregate([
      { $group: { _id: '$faculty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(10),
  ]);

  const [itemTotals, itemDistribution, orderDistribution] = await Promise.all([
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.category', qty: { $sum: '$items.quantity' } } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: { category: '$items.category', distributed: '$distributed' },
          qty: { $sum: '$items.quantity' },
        },
      },
    ]),
    Order.aggregate([{ $group: { _id: '$distributed', count: { $sum: 1 } } }]),
  ]);

  const totalShirts = itemTotals.find((i) => i._id === 'tshirt')?.qty || 0;
  const totalBangles = itemTotals.find((i) => i._id === 'bangle')?.qty || 0;

  const distributedQty = (category) =>
    itemDistribution.find((i) => i._id.category === category && i._id.distributed === true)?.qty || 0;
  const totalShirtsDistributed = distributedQty('tshirt');
  const totalBanglesDistributed = distributedQty('bangle');

  const ordersDistributed = orderDistribution.find((o) => o._id === true)?.count || 0;
  const ordersPendingDistribution = orderDistribution.find((o) => o._id === false || o._id == null)?.count || 0;

  res.json({
    totalOrders: totals[0]?.totalOrders || 0,
    totalRevenue: totals[0]?.totalRevenue || 0,
    totalShirts,
    totalBangles,
    totalBundles: totals[0]?.totalBundles || 0,
    ordersToday: todayTotals[0]?.ordersToday || 0,
    revenueToday: todayTotals[0]?.revenueToday || 0,
    mostPopularShirtColor: colorAgg[0]?._id || null,
    mostPopularSize: sizeAgg[0]?._id || null,
    mostPopularBatch: batchAgg[0]?._id || null,
    colorDistribution: colorAgg,
    sizeDistribution: sizeAgg,
    batchDistribution: batchAgg,
    facultyDistribution: facultyAgg,
    departmentDistribution: departmentAgg,
    recentOrders,
    totalShirtsDistributed,
    totalBanglesDistributed,
    totalShirtsRemaining: totalShirts - totalShirtsDistributed,
    totalBanglesRemaining: totalBangles - totalBanglesDistributed,
    ordersDistributed,
    ordersPendingDistribution,
  });
});

const listAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select('-password');
  res.json({ admins });
});

const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An admin with this email already exists');

  const hashed = await Admin.hashPassword(password);
  const admin = await Admin.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: role === 'superadmin' ? 'superadmin' : 'admin',
  });

  res.status(201).json({
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

const deleteAdmin = asyncHandler(async (req, res) => {
  if (req.params.id === req.admin.id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }
  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) throw new ApiError(404, 'Admin not found');
  res.status(204).send();
});

const resetAdminPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }
  const hashed = await Admin.hashPassword(password);
  const admin = await Admin.findByIdAndUpdate(req.params.id, { password: hashed });
  if (!admin) throw new ApiError(404, 'Admin not found');
  res.json({ message: 'Password reset successfully' });
});

module.exports = { getAnalytics, listAdmins, createAdmin, deleteAdmin, resetAdminPassword };
