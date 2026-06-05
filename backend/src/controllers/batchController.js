const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all batches (filterable by courseId)
 * @route   GET /api/v1/batches
 * @access  Private (Authenticated)
 */
const getBatches = async (req, res, next) => {
  try {
    const { courseId, isActive } = req.query;
    const where = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const batches = await prisma.batch.findMany({
      where,
      include: {
        course: {
          select: { id: true, name: true, code: true }
        },
        faculty: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return res.status(200).json(batches);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new batch
 * @route   POST /api/v1/batches
 * @access  Private (Admin only)
 */
const createBatch = async (req, res, next) => {
  try {
    const { name, courseId, startDate, endDate, facultyId } = req.body;

    if (!name || !courseId || !startDate) {
      return res.status(400).json({
        message: 'Missing required fields. name, courseId, and startDate are required.'
      });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(400).json({ message: 'Course not found' });
    }

    // Parse dates
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Invalid startDate format' });
    }

    let end = null;
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid endDate format' });
      }
    }

    // Verify faculty exists if provided
    if (facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId }
      });
      if (!faculty) {
        return res.status(400).json({ message: 'Faculty not found' });
      }
    }

    const newBatch = await prisma.batch.create({
      data: {
        name,
        courseId,
        startDate: start,
        endDate: end,
        facultyId: facultyId || null
      }
    });

    return res.status(201).json({
      message: 'Batch created successfully',
      data: newBatch
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatches,
  createBatch
};
