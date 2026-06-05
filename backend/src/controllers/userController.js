const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all staff users (ADMIN, SUPER_ADMIN, RECEPTIONIST)
 * @route   GET /api/v1/users/staff
 * @access  Private (Admin, Receptionist)
 */
const getStaffUsers = async (req, res, next) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return res.status(200).json(staff);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffUsers
};
