const express = require('express');
const {
  createOrder,
  listOrders,
  getOrder,
  updateOrder,
  updateStatus,
  updateDistributed,
  addNote,
  deleteOrder,
  downloadPaymentSlip,
} = require('../controllers/orderController');
const { createOrderValidator, updateOrderValidator } = require('../validators/orderValidator');
const validate = require('../validators/validate');
const { verifyJWT, requireRole } = require('../middleware/auth');
const uploadPaymentSlip = require('../middleware/uploadPaymentSlip');

const router = express.Router();

router.post(
  '/',
  uploadPaymentSlip.single('paymentSlip'),
  createOrderValidator,
  validate,
  createOrder
);
router.get('/', verifyJWT, listOrders);
router.get('/:orderId', verifyJWT, getOrder);
router.get('/:orderId/payment-slip', verifyJWT, downloadPaymentSlip);
router.put('/:orderId', verifyJWT, updateOrderValidator, validate, updateOrder);
router.patch('/:orderId/status', verifyJWT, updateStatus);
router.patch('/:orderId/distributed', verifyJWT, updateDistributed);
router.patch('/:orderId/notes', verifyJWT, addNote);
router.delete('/:orderId', verifyJWT, requireRole('superadmin'), deleteOrder);

module.exports = router;
