const express = require('express');
const router = express.Router();
const {
  getBatches,
  createBatch,
  getBatchById,
  updateBatch,
  toggleBatchStatus,
  getBatchStudents
} = require('../controllers/batchController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', authenticate, getBatches);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), createBatch);
router.get('/:id', authenticate, getBatchById);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateBatch);
router.patch('/:id/toggle-status', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), toggleBatchStatus);
router.get('/:id/students', authenticate, getBatchStudents);

module.exports = router;
