const path = require('path');
const fs = require('fs');
const os = require('os');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

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
      .field('faculty', 'Engineering')
      .field('department', 'CSE')
      .field('items', JSON.stringify(items))
      .field('tamperedTotal', '1')
      .attach('paymentSlip', testFilePath);

    expect(res.status).toBe(201);
    expect(res.body.finalTotal).toBe(3550);

    const persisted = await Order.findOne({ orderId: res.body.orderId });
    expect(persisted.finalTotal).toBe(3550);
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
      .field('faculty', 'Engineering')
      .field('department', 'CSE')
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
      .field('faculty', 'Engineering')
      .field('department', 'CSE')
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
