import 'dotenv/config';
import { prisma } from './src/config/db.js';
import bcrypt from 'bcryptjs';

const hash = await bcrypt.hash('Admin@1234', 10);

await prisma.user.update({
  where: { email: 'admin@citysports.co.ke' },
  data: { password: hash },
});

const user = await prisma.user.findUnique({
  where: { email: 'admin@citysports.co.ke' }
});

const match = await bcrypt.compare('Admin@1234', user.password);
console.log('Email:', user.email);
console.log('Role:', user.role);
console.log('Password matches:', match);

await prisma.$disconnect();