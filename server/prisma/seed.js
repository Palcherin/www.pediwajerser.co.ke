import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const cretorId = "clgqj8h9o0000l6l7v1a2b3c"; // Replace with an actual user ID from your database

async function main() {
    await prisma.product.createMany({
        data: [
            {
                name: "Product 1",
                description: "Description for Product 1",
                price: 19.99,
                creatorId: cretorId
            },
            {
                name: "Product 2",
                description: "Description for Product 2",
                price: 29.99,
                creatorId: cretorId
            }
        ]
    });
}

const main= async () => {
    try {
        await main();
        console.log("✅ Database seeded successfully");
    } catch (error) {
        console.error("❌ Database seeding failed:", error);
    } finally {
        await prisma.$disconnect();
    }
};

main();