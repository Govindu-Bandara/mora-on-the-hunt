const mongoose = require('mongoose');

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const ORDER_STATUSES = ['Pending Verification', 'Verified', 'Completed', 'Cancelled'];
const FACULTY_OPTIONS = [
  'Faculty of Engineering',
  'Faculty of IT',
  'Faculty of Medicine',
  'Faculty of Architecture',
  'Faculty of Business',
  'BIT',
  'NDT',
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['tshirt', 'bangle'], required: true },
    color: { type: String, required: true },
    size: { type: String, enum: SIZES, default: null },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    indexOrNic: { type: String, required: true, trim: true },
    telephone: { type: String, required: true, trim: true },
    batch: { type: String, required: true, trim: true },
    faculty: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    bundleCount: { type: Number, required: true, min: 0 },
    bundleSavings: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0 },
    finalTotal: { type: Number, required: true, min: 0 },
    paymentReference: { type: String, required: true, trim: true },
    comment: { type: String, default: '', trim: true, maxlength: 1000 },
    paymentSlip: {
      key: { type: String, required: true },
      originalName: { type: String, required: true },
      mimetype: { type: String, required: true },
      size: { type: Number, required: true },
    },
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending Verification' },
    notes: { type: [noteSchema], default: [] },
    distributed: { type: Boolean, default: false },
    distributedAt: { type: Date, default: null },
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.index({ fullName: 'text', telephone: 'text', indexOrNic: 'text' });

module.exports = mongoose.model('Order', orderSchema);
module.exports.SIZES = SIZES;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.FACULTY_OPTIONS = FACULTY_OPTIONS;
