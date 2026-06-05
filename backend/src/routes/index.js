const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const studentRoutes = require('./studentRoutes');
const inquiryRoutes = require('./inquiryRoutes');
const admissionRoutes = require('./admissionRoutes');
const facultyRoutes = require('./facultyRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const salaryRoutes = require('./salaryRoutes');
const examRoutes = require('./examRoutes');
const courseRoutes = require('./courseRoutes');
const batchRoutes = require('./batchRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/admissions', admissionRoutes);
router.use('/faculty', facultyRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/salary', salaryRoutes);
router.use('/exams', examRoutes);
router.use('/courses', courseRoutes);
router.use('/batches', batchRoutes);

module.exports = router;
