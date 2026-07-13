const { Readable } = require('stream');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

jest.mock('../src/services/storageService', () => ({
  uploadFile: jest.fn().mockResolvedValue('products/fake-key.jpg'),
  getFileStream: jest.fn(),
  deleteFile: jest.fn().mockResolvedValue(undefined),
}));

let mongod;
let app;
let Admin;
let token;
const storageService = require('../src/services/storageService');

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.NODE_ENV = 'test';

  await mongoose.connect(process.env.MONGO_URI);

  // eslint-disable-next-line global-require
  app = require('../src/app');
  // eslint-disable-next-line global-require
  Admin = require('../src/models/Admin');
  // eslint-disable-next-line global-require
  const jwt = require('jsonwebtoken');

  const hashed = await Admin.hashPassword('password123');
  const admin = await Admin.create({
    name: 'Product Test Admin',
    email: 'product-admin@test.com',
    password: hashed,
    role: 'admin',
  });
  token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('POST /api/products/upload-images', () => {
  test('rejects without a token', async () => {
    const res = await request(app)
      .post('/api/products/upload-images')
      .attach('images', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), 'shirt.jpg');
    expect(res.status).toBe(401);
  });

  test('uploads images and returns their public URLs', async () => {
    const res = await request(app)
      .post('/api/products/upload-images')
      .set('Authorization', `Bearer ${token}`)
      .attach('images', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), 'shirt.jpg');

    expect(res.status).toBe(201);
    expect(res.body.images).toHaveLength(1);
    expect(res.body.images[0].key).toBe('products/fake-key.jpg');
    expect(res.body.images[0].url).toMatch(/\/api\/products\/image\?key=/);
  });

  test('rejects a disallowed file type', async () => {
    const res = await request(app)
      .post('/api/products/upload-images')
      .set('Authorization', `Bearer ${token}`)
      .attach('images', Buffer.from('not an image'), 'shirt.exe');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/products/image', () => {
  test('rejects a key outside the products/ prefix', async () => {
    const res = await request(app).get('/api/products/image').query({ key: 'payment-slips/x.jpg' });
    expect(res.status).toBe(400);
  });

  test('streams the image for a valid key, publicly, with no auth required', async () => {
    storageService.getFileStream.mockResolvedValueOnce(Readable.from([Buffer.from('fake-image-bytes')]));

    const res = await request(app).get('/api/products/image').query({ key: 'products/abc.png' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/png');
  });
});
