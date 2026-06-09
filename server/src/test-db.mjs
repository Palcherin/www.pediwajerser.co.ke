import 'dotenv/config';
import pg from 'pg';

console.log('URL:', process.env.DATABASE_URL);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  const result = await pool.query(
    'SELECT 1 as test'
  );

  console.log(
    '✅ Direct pg connection works:',
    result.rows
  );
} catch (err) {
  console.log(
    '❌ pg connection failed:',
    err.message
  );
} finally {
  await pool.end();
}