import './config/db.js';
import {connectDB,disconnectDB, prisma} from './config/db.js';

async function main() {
  try {
    const count = await prisma.product.count();
    console.log(`✅ Prisma connected! Total products: ${count}`);
  } catch (error) {
    console.error('❌ Prisma Error:', error);
  }
}

main();