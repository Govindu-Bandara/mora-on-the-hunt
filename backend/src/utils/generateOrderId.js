const Counter = require('../models/Counter');

async function generateOrderId() {
  const counter = await Counter.findByIdAndUpdate(
    'orderId',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `MORA-${String(counter.seq).padStart(6, '0')}`;
}

module.exports = generateOrderId;
