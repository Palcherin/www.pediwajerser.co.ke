import 'dotenv/config';
import { prisma } from './src/config/db.js';
// Fix updatedAt columns first
await prisma.$executeRawUnsafe(`ALTER TABLE "categories" ALTER COLUMN "updatedAt" SET DEFAULT NOW()`);
await prisma.$executeRawUnsafe(`ALTER TABLE "products" ALTER COLUMN "updatedAt" SET DEFAULT NOW()`);
console.log('✅ Fixed updatedAt columns');

const categories = [
  { name: 'New Season',   slug: 'new-season',   description: 'Latest kits and gear for the 2025/26 season',   image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400' },
  { name: 'Retro Kits',   slug: 'retro-kits',   description: 'Classic football jerseys from the golden eras',  image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400' },
  { name: 'Footwear',     slug: 'footwear',     description: 'Premium boots and trainers for every pitch',     image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { name: 'Backpacks',    slug: 'backpacks',    description: 'Durable training and matchday bags',             image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
  { name: 'Special Kits', slug: 'special-kits', description: 'Limited edition and special release kits',       image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400' },
  { name: 'Others',       slug: 'others',       description: 'Other sports equipment and accessories',         image: 'https://images.unsplash.com/photo-1526976668912-3f65a7c6c8f3?w=400' },
];

for (const cat of categories) {
  const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
  if (existing) {
    console.log(`⏭️  Already exists: ${cat.name}`);
  } else {
    await prisma.category.create({ data: cat });
    console.log(`✅ Created: ${cat.name}`);
  }
}

await prisma.$disconnect();