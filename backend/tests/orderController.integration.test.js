const path = require('path');
const fs = require('fs');
const os = require('os');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

jest.mock('../src/services/storageService', () => ({
  uploadFile: jest.fn().mockResolvedValue('payment-slips/fake-key.jpg'),
  getFileStream: jest.fn(),
  deleteFile: jest.fn().mockResolvedValue(undefined),
}));

let mongod;
let app;
let Product;
let Order;
let testFilePath;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.NODE_ENV = 'test';

  await mongoose.connect(process.env.MONGO_URI);

  // eslint-disable-next-line global-require
  app = require('../src/app');
  // eslint-disable-next-line global-require
  Product = require('../src/models/Product');
  // eslint-disable-next-line global-require
  Order = require('../src/models/Order');

  testFilePath = path.join(os.tmpdir(), 'test-payment-slip.jpg');
  fs.writeFileSync(testFilePath, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
});

describe('POST /api/orders', () => {
  test('recomputes total server-side, ignoring any client-submitted total', async () => {
    const shirt = await Product.create({
      name: 'White T-Shirt',
      category: 'tshirt',
      color: 'White',
      currentPrice: 1700,
      available: true,
    });
    const bangle = await Product.create({
      name: 'White Bangle',
      category: 'bangle',
      color: 'White',
      currentPrice: 200,
      available: true,
    });

    const items = [
      { productId: shirt._id.toString(), size: 'M', quantity: 1 },
      { productId: shirt._id.toString(), size: 'L', quantity: 1 },
      { productId: bangle._id.toString(), quantity: 1 },
    ];

    const res = await request(app)
      .post('/api/orders')
      .field('fullName', 'Jane Doe')
      .field('indexOrNic', '200012345')
      .field('telephone', '0771234567')
      .field('batch', '2020')
      .field('faculty', 'Faculty of Engineering')
      .field('department', 'CSE')
      .field('paymentReference', 'REF-TEST-123')
      .field('items', JSON.stringify(items))
      .field('tamperedTotal', '1')
      .attach('paymentSlip', testFilePath);

    expect(res.status).toBe(201);
    expect(res.body.finalTotal).toBe(3600);

    const persisted = await Order.findOne({ orderId: res.body.orderId });
    expect(persisted.finalTotal).toBe(3600);
    expect(persisted.bundleCount).toBe(1);
    expect(persisted.items).toHaveLength(3);
  });

  test('rejects order with no payment slip', async () => {
    const shirt = await Product.findOne({ category: 'tshirt' });
    const res = await request(app)
      .post('/api/orders')
      .field('fullName', 'John Doe')
      .field('indexOrNic', '200099999')
      .field('telephone', '0771234567')
      .field('batch', '2020')
      .field('faculty', 'Faculty of Engineering')
      .field('department', 'CSE')
      .field('paymentReference', 'REF-TEST-123')
      .field('items', JSON.stringify([{ productId: shirt._id.toString(), size: 'M', quantity: 1 }]));

    expect(res.status).toBe(400);
  });

  test('rejects a disallowed file type', async () => {
    const shirt = await Product.findOne({ category: 'tshirt' });
    const badFile = path.join(os.tmpdir(), 'test-payment-slip.exe');
    fs.writeFileSync(badFile, Buffer.from('not an image'));

    const res = await request(app)
      .post('/api/orders')
      .field('fullName', 'Bad File')
      .field('indexOrNic', '200011111')
      .field('telephone', '0771234567')
      .field('batch', '2020')
      .field('faculty', 'Faculty of Engineering')
      .field('department', 'CSE')
      .field('paymentReference', 'REF-TEST-123')
      .field('items', JSON.stringify([{ productId: shirt._id.toString(), size: 'M', quantity: 1 }]))
      .attach('paymentSlip', badFile);

    expect(res.status).toBe(400);
    fs.unlinkSync(badFile);
  });
});

describe('Auth-gated order routes', () => {
  test('GET /api/orders without a token is rejected', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/orders/:orderId', () => {
  let token;

  beforeAll(async () => {
    // eslint-disable-next-line global-require
    const Admin = require('../src/models/Admin');
    // eslint-disable-next-line global-require
    const jwt = require('jsonwebtoken');
    const hashed = await Admin.hashPassword('password123');
    const admin = await Admin.create({
      name: 'Edit Test Admin',
      email: 'edit-admin@test.com',
      password: hashed,
      role: 'admin',
    });
    token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
  });

  test('recomputes totals when an admin edits order items', async () => {
    const shirt = await Product.findOne({ category: 'tshirt' });
    const bangle = await Product.findOne({ category: 'bangle' });

    const createRes = await request(app)
      .post('/api/orders')
      .field('fullName', 'Edit Me')
      .field('indexOrNic', '200055555')
      .field('telephone', '0771234567')
      .field('batch', '2021')
      .field('faculty', 'Faculty of Engineering')
      .field('department', 'CSE')
      .field('paymentReference', 'REF-TEST-123')
      .field('items', JSON.stringify([{ productId: shirt._id.toString(), size: 'M', quantity: 1 }]))
      .attach('paymentSlip', testFilePath);

    expect(createRes.status).toBe(201);
    const { orderId } = createRes.body;

    const updateRes = await request(app)
      .put(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'Edited Name',
        indexOrNic: '200055555',
        telephone: '0779999999',
        batch: '2021',
        faculty: 'Faculty of Engineering',
        department: 'CSE',
        items: [
          { productId: shirt._id.toString(), size: 'M', quantity: 1 },
          { productId: bangle._id.toString(), quantity: 1 },
        ],
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.order.fullName).toBe('Edited Name');
    expect(updateRes.body.order.finalTotal).toBe(1900); // 1 shirt + 1 bangle bundled
    expect(updateRes.body.order.items).toHaveLength(2);
  });

  test('rejects edit without a token', async () => {
    const res = await request(app).put('/api/orders/MORA-000001').send({});
    expect(res.status).toBe(401);
  });
});

describe('Flag filter and PDF export', () => {
  let token;

  function buildOrder(overrides) {
    return {
      orderId: `MORA-TEST-${Math.random().toString(36).slice(2, 8)}`,
      fullName: 'Filter Test',
      indexOrNic: '200077777',
      telephone: '0771234567',
      batch: '2022',
      faculty: 'Faculty of Engineering',
      department: 'CSE',
      paymentReference: 'REF-FLAG',
      items: [
        { product: new mongoose.Types.ObjectId(), name: 'White T-Shirt', category: 'tshirt', color: 'White', size: 'M', quantity: 1, unitPrice: 1700 },
      ],
      bundleCount: 0,
      bundleSavings: 0,
      subtotal: 1700,
      discount: 0,
      finalTotal: 1700,
      paymentSlip: { key: 'payment-slips/x.jpg', originalName: 'x.jpg', mimetype: 'image/jpeg', size: 10 },
      ...overrides,
    };
  }

  beforeAll(async () => {
    // eslint-disable-next-line global-require
    const Admin = require('../src/models/Admin');
    // eslint-disable-next-line global-require
    const jwt = require('jsonwebtoken');
    const hashed = await Admin.hashPassword('password123');
    const admin = await Admin.create({
      name: 'Export Test Admin',
      email: 'export-admin@test.com',
      password: hashed,
      role: 'admin',
    });
    token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);

    await Order.create(buildOrder({ flagged: true }));
    await Order.create(buildOrder({ flagged: false }));
  });

  test('GET /api/orders?flagged=true returns only flagged orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .query({ flagged: 'true', limit: 100 })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.orders.length).toBeGreaterThan(0);
    expect(res.body.orders.every((o) => o.flagged === true)).toBe(true);
  });

  test('GET /api/orders/export?range=all returns a PDF for an authed admin', async () => {
    const res = await request(app)
      .get('/api/orders/export')
      .query({ range: 'all' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="mora-orders-all-/);
  });

  test('GET /api/orders/export is rejected without a token', async () => {
    const res = await request(app).get('/api/orders/export').query({ range: 'today' });
    expect(res.status).toBe(401);
  });
});
