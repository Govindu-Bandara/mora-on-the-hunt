const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const generateOrderId = require('../src/utils/generateOrderId');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('generateOrderId', () => {
  test('produces sequential, zero-padded, prefixed IDs', async () => {
    const first = await generateOrderId();
    const second = await generateOrderId();
    expect(first).toMatch(/^MORA-\d{6}$/);
    expect(second).toMatch(/^MORA-\d{6}$/);
    const firstSeq = Number(first.split('-')[1]);
    const secondSeq = Number(second.split('-')[1]);
    expect(secondSeq).toBe(firstSeq + 1);
  });

  test('concurrent calls never collide', async () => {
    const ids = await Promise.all(Array.from({ length: 20 }, () => generateOrderId()));
    const unique = new Set(ids);
    expect(unique.size).toBe(20);
  });
});
