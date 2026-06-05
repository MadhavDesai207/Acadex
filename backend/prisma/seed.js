const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean up existing records in reverse dependency order
  await prisma.student.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Hash the passwords
  const salt = await bcrypt.genSalt(10);
  
  // 1. Password for the user's desired account
  const userPasswordHash = await bcrypt.hash('Madhav12@', salt);
  
  // 2. Password for the default superadmin account
  const defaultAdminPasswordHash = await bcrypt.hash('AdminSecretPass123', salt);

  // Seed user's account
  const userAccount = await prisma.user.create({
    data: {
      name: 'Madhav Desai',
      email: 'mddesai207@gmail.com',
      password: userPasswordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  // Seed default system superadmin
  const defaultAdmin = await prisma.user.create({
    data: {
      name: 'System Super Admin',
      email: 'superadmin@eduerp.com',
      password: defaultAdminPasswordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  // Seed default courses
  const courseCS = await prisma.course.create({
    data: {
      name: 'Computer Science',
      code: 'CS',
      durationMonths: 36,
      fees: 5000.00,
      isActive: true,
    },
  });

  const courseIT = await prisma.course.create({
    data: {
      name: 'Information Technology',
      code: 'IT',
      durationMonths: 36,
      fees: 4500.00,
      isActive: true,
    },
  });

  const courseBS = await prisma.course.create({
    data: {
      name: 'Bio-Science',
      code: 'BS',
      durationMonths: 24,
      fees: 4000.00,
      isActive: true,
    },
  });

  // Seed default batches
  const batchCSA = await prisma.batch.create({
    data: {
      name: 'Batch 2026-A',
      courseId: courseCS.id,
      startDate: new Date('2026-06-01'),
      isActive: true,
    },
  });

  const batchCSB = await prisma.batch.create({
    data: {
      name: 'Batch 2026-B',
      courseId: courseCS.id,
      startDate: new Date('2026-06-15'),
      isActive: true,
    },
  });

  const batchITC = await prisma.batch.create({
    data: {
      name: 'Batch 2026-C',
      courseId: courseIT.id,
      startDate: new Date('2026-06-01'),
      isActive: true,
    },
  });

  const batchBSD = await prisma.batch.create({
    data: {
      name: 'Batch 2026-D',
      courseId: courseBS.id,
      startDate: new Date('2026-06-01'),
      isActive: true,
    },
  });

  console.log('Seeding completed successfully!');
  console.log('Seeded Users:');
  console.log(`- Email: ${userAccount.email} | Role: ${userAccount.role}`);
  console.log(`- Email: ${defaultAdmin.email} | Role: ${defaultAdmin.role}`);
  console.log('Seeded Courses:');
  console.log(`- CS (ID: ${courseCS.id})`);
  console.log(`- IT (ID: ${courseIT.id})`);
  console.log(`- BS (ID: ${courseBS.id})`);
  console.log('Seeded Batches:');
  console.log(`- ${batchCSA.name} (CS)`);
  console.log(`- ${batchCSB.name} (CS)`);
  console.log(`- ${batchITC.name} (IT)`);
  console.log(`- ${batchBSD.name} (BS)`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
