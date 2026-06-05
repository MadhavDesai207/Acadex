const express = require('express');
const router = express.Router();
const { getStaffUsers } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/v1/users/staff
 * @desc    Get all staff users (ADMIN, SUPER_ADMIN, RECEPTIONIST)
 * @access  Private (ADMIN, SUPER_ADMIN, RECEPTIONIST)
 */
router.get(
  '/staff',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'),
  getStaffUsers
);

module.exports = router;
