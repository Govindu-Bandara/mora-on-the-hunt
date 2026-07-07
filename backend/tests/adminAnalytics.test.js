const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

let mongod;
let app;
let Order;
let Product;
let Admin;
let token;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.NODE_ENV = 'test';

  await mongoose.connect(process.env.MONGO_URI);

  // eslint-disable-next-line global-require
  app = require('../src/app');
  // eslint-disable-next-line global-require
  Order = require('../src/models/Order');
  // eslint-disable-next-line global-require
  Product = require('../src/models/Product');
  // eslint-disable-next-line global-require
  Admin = require('../src/models/Admin');

  const hashed = await Admin.hashPassword('password123');
  const admin = await Admin.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: hashed,
    role: 'superadmin',
  });

  const jwt = require('jsonwebtoken');
  token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('GET /api/admin/analytics distribution stats', () => {
  test('handles legacy orders that predate the distributed field (no crash, no undefined)', async () => {
    const shirt = await Product.create({
      name: 'White T-Shirt',
      category: 'tshirt',
      color: 'White',
      currentPrice: 1700,
      available: true,
    });

    // Simulate a pre-existing order created before `distributed` existed on the
    // schema, by inserting via the raw collection (bypassing Mongoose defaults).
    await mongoose.connection.collection('orders').insertOne({
      orderId: 'MORA-LEGACY-1',
      fullName: 'Legacy Order',
      indexOrNic: '123',
      telephone: '0771234567',
      batch: '2020',
      faculty: 'Engineering',
      department: 'CSE',
      items: [
        {
          product: shirt._id,
          name: shirt.name,
          category: 'tshirt',
          color: 'White',
          size: 'M',
          quantity: 1,
          unitPrice: 1700,
        },
      ],
      bundleCount: 0,
      bundleSavings: 0,
      subtotal: 1700,
      discount: 0,
      finalTotal: 1700,
      paymentSlip: { filename: 'a', originalName: 'a', mimetype: 'image/jpeg', path: 'a', size: 1 },
      status: 'Pending Verification',
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      // no `distributed` / `distributedAt` fields at all
    });

    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalShirtsDistributed).toBe(0);
    expect(res.body.totalShirtsRemaining).toBe(res.body.totalShirts);
    expect(res.body.ordersDistributed).toBe(0);
    expect(res.body.ordersPendingDistribution).toBeGreaterThanOrEqual(1);
    expect(Number.isNaN(res.body.totalShirtsDistributed)).toBe(false);
    expect(Number.isNaN(res.body.totalShirtsRemaining)).toBe(false);
  });
});
