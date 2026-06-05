const express = require('express');
const router = express.Router();
const { getBatches, createBatch } = require('../controllers/batchController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', authenticate, getBatches);
router.post('/', authenticate, authorize('ADMIN'), createBatch);

module.exports = router;
