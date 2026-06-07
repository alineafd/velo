import { Pool } from 'pg';

const urls = [
  "postgresql://postgres.znwprdwniwtocmitjwjj:n5Eyq7sI3nfMOFG7@aws-0-sa-east-1.pooler.supabase.com:6543/postgres",
  "postgresql://postgres.znwprdwniwtocmitjwjj:n5Eyq7sI3nfMOFG7@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
  "postgresql://postgres.znwprdwniwtocmitjwjj:n5Eyq7sI3nfMOFG7@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
];

async function test(url) {
  const pool = new Pool({ connectionString: url });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`Success with ${url}:`, res.rows[0]);
  } catch (err) {
    console.error(`Error with ${url}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  for (let url of urls) {
    await test(url);
  }
}

run();
