// scripts/migrateToImageKit.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma }      from '../config/db.js';
import { uploadImage } from '../services/imagekit.js';

const migrateImages = async () => {
  const products = await prisma.product.findMany();

  for (const product of products) {
    let images = [];
    try { images = JSON.parse(product.images || '[]'); } catch { continue; }

    const newImages = [];

    for (const imgPath of images) {
      // Skip if already a full URL (already on ImageKit or external)
      if (imgPath.startsWith('http')) {
        newImages.push(imgPath);
        continue;
      }

      // Local file path e.g. /uploads/filename.jpg
      const localPath = path.join(process.cwd(), imgPath);

      if (!fs.existsSync(localPath)) {
        console.log(`⚠️  File not found: ${localPath}`);
        continue;
      }

      try {
        const buffer   = fs.readFileSync(localPath);
        const fileName = path.basename(localPath);
        const url      = await uploadImage(buffer, fileName, 'products');
        newImages.push(url);
        console.log(`✅ Migrated: ${fileName} → ${url}`);
      } catch (err) {
        console.error(`❌ Failed: ${imgPath}`, err.message);
        newImages.push(imgPath); // keep old path as fallback
      }
    }

    await prisma.product.update({
      where: { id: product.id },
      data:  { images: JSON.stringify(newImages) },
    });

    console.log(`Updated product: ${product.name}`);
  }

  console.log('Migration complete!');
  await prisma.$disconnect();
};

migrateImages();