const { body } = require('express-validator');
const { SIZES } = require('../models/Order');

const VALID_SIZES = SIZES || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const createOrderValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').escape(),
  body('indexOrNic').trim().notEmpty().withMessage('Index/NIC number is required').escape(),
  body('telephone')
    .trim()
    .notEmpty()
    .withMessage('Telephone number is required')
    .matches(/^[0-9+()\-\s]{7,15}$/)
    .withMessage('Telephone number is invalid'),
  body('batch').trim().notEmpty().withMessage('Batch is required').escape(),
  body('faculty').trim().notEmpty().withMessage('Faculty is required').escape(),
  body('department').trim().notEmpty().withMessage('Department is required').escape(),
  body('items')
    .custom((value) => {
      let parsed;
      try {
        parsed = typeof value === 'string' ? JSON.parse(value) : value;
      } catch {
        throw new Error('Items must be valid JSON');
      }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('At least one item is required');
      }
      for (const item of parsed) {
        if (!item.productId || typeof item.productId !== 'string') {
          throw new Error('Each item must reference a productId');
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new Error('Each item must have a positive integer quantity');
        }
        if (item.size !== undefined && item.size !== null && !VALID_SIZES.includes(item.size)) {
          throw new Error('Invalid size selection');
        }
      }
      return true;
    })
    .withMessage('Items are invalid'),
];

module.exports = { createOrderValidator };
