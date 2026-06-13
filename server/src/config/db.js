import { PrismaClient } from '@prisma/client';
import { PrismaPg }     from '@prisma/adapter-pg';
import pg               from 'pg';

const pool = new pg.Pool({
  connectionString:        process.env.DATABASE_URL,
  max:                     3,
  idleTimeoutMillis:       30000,
  connectionTimeoutMillis: 30000, // ← increased from 10s to 30s for Neon cold starts
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Pool error:', err.message);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// ── Retry wrapper — use this for all DB calls that might hit a cold start ──
export const withRetry = async (fn, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isTimeout = err.message?.includes('timeout') ||
                        err.message?.includes('Connection terminated');
      if (isTimeout && i < retries - 1) {
        console.warn(`DB timeout, retrying (${i + 1}/${retries})...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
};

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
  await pool.end();
};