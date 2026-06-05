const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * @desc    Create a new faculty & user account
 * @route   POST /api/v1/faculty
 * @access  Private (Admin only)
 */
const createFaculty = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      designation,
      department,
      dateOfJoining,
      qualification,
      bankAccount,
      baseSalary
    } = req.body;

    // Validate required fields
    if (!name || !email || !designation || !dateOfJoining || baseSalary === undefined) {
      return res.status(400).json({
        message: 'Missing required fields. name, email, designation, dateOfJoining, and baseSalary are required.'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email address already exists'
      });
    }

    // Parse dateOfJoining
    const joiningDate = new Date(dateOfJoining);
    if (isNaN(joiningDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid dateOfJoining format. Please provide a valid date.'
      });
    }

    // Parse and validate baseSalary
    const salary = parseFloat(baseSalary);
    if (isNaN(salary) || salary < 0) {
      return res.status(400).json({
        message: 'Invalid baseSalary. Please provide a positive numeric value.'
      });
    }

    // Generate unique employeeCode: FAC-<YEAR>-<SEQUENCE>
    const year = new Date().getFullYear();
    const prefix = `FAC-${year}-`;

    const lastFaculty = await prisma.faculty.findFirst({
      where: {
        employeeCode: {
          startsWith: prefix
        }
      },
      orderBy: {
        employeeCode: 'desc'
      }
    });

    let sequence = 1;
    if (lastFaculty) {
      const parts = lastFaculty.employeeCode.split('-');
      const lastSeqStr = parts[parts.length - 1];
      const lastSeq = parseInt(lastSeqStr, 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    const employeeCode = `${prefix}${String(sequence).padStart(3, '0')}`;
    const autoPassword = `FAC@${employeeCode}`;

    // Hash the password (bcrypt salt rounds: 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(autoPassword, salt);

    // Execute User & Faculty creation in a Prisma transaction
    const newFaculty = await prisma.$transaction(async (tx) => {
      // Create associated User account
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'FACULTY',
          phone: phone || null,
          isActive: true
        }
      });

      // Create Faculty profile linked to User
      const faculty = await tx.faculty.create({
        data: {
          userId: user.id,
          employeeCode,
          designation,
          department: department || null,
          dateOfJoining: joiningDate,
          qualification: qualification || null,
          bankAccount: bankAccount || null,
          baseSalary: salary,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              isActive: true
            }
          }
        }
      });

      return faculty;
    });

    return res.status(201).json({
      message: 'Faculty profile and account created successfully',
      data: newFaculty
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all faculty profiles (filterable)
 * @route   GET /api/v1/faculty
 * @access  Private (Admin only)
 */
const getFaculty = async (req, res, next) => {
  try {
    const { department, designation, isActive, search } = req.query;

    const where = {};

    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    if (designation) {
      where.designation = { contains: designation, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      const searchTrimmed = search.trim();
      where.OR = [
        { employeeCode: { contains: searchTrimmed, mode: 'insensitive' } },
        { designation: { contains: searchTrimmed, mode: 'insensitive' } },
        { department: { contains: searchTrimmed, mode: 'insensitive' } },
        { user: { name: { contains: searchTrimmed, mode: 'insensitive' } } },
        { user: { email: { contains: searchTrimmed, mode: 'insensitive' } } }
      ];
    }

    const facultyList = await prisma.faculty.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true
          }
        }
      },
      orderBy: {
        employeeCode: 'asc'
      }
    });

    return res.status(200).json(facultyList);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get faculty details by ID
 * @route   GET /api/v1/faculty/:id
 * @access  Private (Admin, own Faculty)
 */
const getFacultyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true
          }
        }
      }
    });

    if (!faculty) {
      return res.status(404).json({
        message: 'Faculty record not found'
      });
    }

    // Access control: Faculty can only view their own profile
    if (req.user.role === 'FACULTY' && faculty.userId !== req.user.userId) {
      return res.status(403).json({
        message: 'Access denied. You can only view your own profile.'
      });
    }

    return res.status(200).json(faculty);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update faculty details
 * @route   PUT /api/v1/faculty/:id
 * @access  Private (Admin only)
 */
const updateFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      designation,
      department,
      dateOfJoining,
      qualification,
      bankAccount,
      baseSalary,
      isActive
    } = req.body;

    // Check if faculty exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: { id }
    });

    if (!existingFaculty) {
      return res.status(404).json({
        message: 'Faculty record not found'
      });
    }

    // Check if email is being updated and if it is already taken
    if (email && email.toLowerCase().trim() !== existingFaculty.email) {
      const user = await prisma.user.findUnique({
        where: { id: existingFaculty.userId }
      });
      if (user && email.toLowerCase().trim() !== user.email) {
        const emailTaken = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() }
        });
        if (emailTaken) {
          return res.status(400).json({
            message: 'A user with this email address already exists'
          });
        }
      }
    }

    let joiningDate;
    if (dateOfJoining) {
      joiningDate = new Date(dateOfJoining);
      if (isNaN(joiningDate.getTime())) {
        return res.status(400).json({
          message: 'Invalid dateOfJoining format'
        });
      }
    }

    let salary;
    if (baseSalary !== undefined) {
      salary = parseFloat(baseSalary);
      if (isNaN(salary) || salary < 0) {
        return res.status(400).json({
          message: 'Invalid baseSalary. Please provide a positive numeric value.'
        });
      }
    }

    // Execute updates in a transaction
    const updatedFaculty = await prisma.$transaction(async (tx) => {
      // 1. Update associated User fields
      const userUpdateData = {};
      if (name) userUpdateData.name = name;
      if (email) userUpdateData.email = email.toLowerCase().trim();
      if (phone !== undefined) userUpdateData.phone = phone;
      if (isActive !== undefined) userUpdateData.isActive = isActive;

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: existingFaculty.userId },
          data: userUpdateData
        });
      }

      // 2. Update Faculty fields
      const facultyUpdateData = {};
      if (designation) facultyUpdateData.designation = designation;
      if (department !== undefined) facultyUpdateData.department = department;
      if (dateOfJoining) facultyUpdateData.dateOfJoining = joiningDate;
      if (qualification !== undefined) facultyUpdateData.qualification = qualification;
      if (bankAccount !== undefined) facultyUpdateData.bankAccount = bankAccount;
      if (baseSalary !== undefined) facultyUpdateData.baseSalary = salary;
      if (isActive !== undefined) facultyUpdateData.isActive = isActive;

      const faculty = await tx.faculty.update({
        where: { id },
        data: facultyUpdateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              isActive: true
            }
          }
        }
      });

      return faculty;
    });

    return res.status(200).json({
      message: 'Faculty profile updated successfully',
      data: updatedFaculty
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle faculty active status (Activate/Deactivate)
 * @route   PATCH /api/v1/faculty/:id/toggle-status
 * @access  Private (Admin only)
 */
const toggleFacultyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const existingFaculty = await prisma.faculty.findUnique({
      where: { id }
    });

    if (!existingFaculty) {
      return res.status(404).json({
        message: 'Faculty record not found'
      });
    }

    let targetStatus = !existingFaculty.isActive;
    if (isActive !== undefined) {
      targetStatus = !!isActive;
    }

    const updatedFaculty = await prisma.$transaction(async (tx) => {
      // Update linked user isActive status
      await tx.user.update({
        where: { id: existingFaculty.userId },
        data: { isActive: targetStatus }
      });

      // Update faculty isActive status
      const faculty = await tx.faculty.update({
        where: { id },
        data: { isActive: targetStatus },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              isActive: true
            }
          }
        }
      });

      return faculty;
    });

    return res.status(200).json({
      message: `Faculty profile ${targetStatus ? 'activated' : 'deactivated'} successfully`,
      data: updatedFaculty
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFaculty,
  getFaculty,
  getFacultyById,
  updateFaculty,
  toggleFacultyStatus
};
