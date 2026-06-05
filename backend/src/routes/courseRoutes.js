const express = require('express');
const router = express.Router();
const { getCourses, createCourse } = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', authenticate, getCourses);
router.post('/', authenticate, authorize('ADMIN'), createCourse);

module.exports = router;
