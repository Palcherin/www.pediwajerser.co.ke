import 'dotenv/config';
import { prisma } from '../config/db.js';

async function fixProductImages() {
  try {
    console.log("🔧 Starting to fix product images...");

    const products = await prisma.product.findMany({
      select: { id: true, images: true, name: true }
    });

    let fixedCount = 0;

    for (const product of products) {
      let currentImages = product.images;

      // Convert to JSON string if it's not already
      if (Array.isArray(currentImages) || (currentImages && typeof currentImages === 'object')) {
        const jsonString = JSON.stringify(currentImages);
        
        await prisma.product.update({
          where: { id: product.id },
          data: { images: jsonString }
        });

        console.log(`✅ Fixed images for: ${product.name}`);
        fixedCount++;
      }
    }

    console.log(`🎉 Finished! Fixed ${fixedCount} products.`);

  } catch (error) {
    console.error("❌ Error fixing images:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductImages();