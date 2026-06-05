const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean up existing users (optional, but good for clean runs)
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

  console.log('Seeding completed successfully!');
  console.log('Seeded Users:');
  console.log(`- Email: ${userAccount.email} | Role: ${userAccount.role}`);
  console.log(`- Email: ${defaultAdmin.email} | Role: ${defaultAdmin.role}`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
