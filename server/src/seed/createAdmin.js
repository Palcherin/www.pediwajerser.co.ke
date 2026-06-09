// seed/createAdmin.js
import 'dotenv/config';
import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    const email = 'admin@citysports.co.ke';
    const plainPassword = 'Admin@1234';

    console.log('🔍 Checking if admin exists...');

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      console.log('✅ Admin already exists');
      console.log('Email:', existing.email);
      console.log('Role:', existing.role);
      return;
    }

    console.log('🛠 Creating new admin...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('🎉 ADMIN CREATED SUCCESSFULLY!');
    console.log('Email:', admin.email);
    console.log('Password:', plainPassword);
    console.log('ID:', admin.id);

  } catch (error) {
    console.error('❌ Failed to create admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();