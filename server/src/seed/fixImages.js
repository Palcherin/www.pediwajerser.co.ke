import 'dotenv/config';
import { prisma } from '../config/db.js';

async function fixProductImages() {
  try {
    console.log("🔧 Starting aggressive image fix...");

    const products = await prisma.product.findMany({
      select: { id: true, images: true, name: true }
    });

    let fixedCount = 0;

    for (const product of products) {
      let raw = product.images;
      let finalString = '[]';

      try {
        // Case 1: Already a proper JSON string
        if (typeof raw === 'string') {
          JSON.parse(raw); // test if valid
          finalString = raw;
        } 
        // Case 2: Array
        else if (Array.isArray(raw)) {
          finalString = JSON.stringify(raw);
        } 
        // Case 3: Object containing stringified array (your current case)
        else if (raw && typeof raw === 'object') {
          const str = JSON.stringify(raw);
          if (str.includes('[') && str.includes(']')) {
            // Try to extract the actual array
            const match = str.match(/\[".*?"\]/);
            if (match) {
              finalString = match[0];
            } else {
              finalString = JSON.stringify(Object.values(raw));
            }
          } else {
            finalString = JSON.stringify(raw);
          }
        }
      } catch (e) {
        console.log(`⚠️  Problem with ${product.name}, forcing empty array`);
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { images: finalString }
      });

      console.log(`✅ Fixed: ${product.name}`);
      fixedCount++;
    }

    console.log(`🎉 Successfully fixed ${fixedCount} products!`);

  } catch (error) {
    console.error("❌ Critical error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductImages();