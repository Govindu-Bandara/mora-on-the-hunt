const express = require('express');
const {
  getAnalytics,
  getDistributionBreakdown,
  listAdmins,
  createAdmin,
  deleteAdmin,
  resetAdminPassword,
} = require('../controllers/adminController');
const { verifyJWT, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(verifyJWT);

router.get('/analytics', getAnalytics);
router.get('/distribution-breakdown', getDistributionBreakdown);

router.get('/admins', requireRole('superadmin'), listAdmins);
router.post('/admins', requireRole('superadmin'), createAdmin);
router.delete('/admins/:id', requireRole('superadmin'), deleteAdmin);
router.patch('/admins/:id/reset-password', requireRole('superadmin'), resetAdminPassword);

module.exports = router;
