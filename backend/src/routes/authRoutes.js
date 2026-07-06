const express = require('express');
const { login, me } = require('../controllers/authController');
const { loginValidator } = require('../validators/authValidator');
const validate = require('../validators/validate');
const { verifyJWT } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', loginLimiter, loginValidator, validate, login);
router.get('/me', verifyJWT, me);

module.exports = router;
