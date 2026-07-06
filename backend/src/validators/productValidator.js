const { body } = require('express-validator');

const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required').escape(),
  body('category').isIn(['tshirt', 'bangle']).withMessage('Category must be tshirt or bangle'),
  body('color').trim().notEmpty().withMessage('Color is required').escape(),
  body('description').optional().trim().escape(),
  body('currentPrice').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('available').optional().isBoolean(),
  body('images').optional().isArray(),
];

module.exports = { productValidator };
