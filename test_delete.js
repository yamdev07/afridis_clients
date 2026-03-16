
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testDelete() {
  try {
    // 1. Get a test user (commercial or admin)
    const res = await pool.query("SELECT id, name FROM users WHERE role IN ('admin', 'commercial') LIMIT 1");
    if (res.rows.length === 0) {
      console.log("No test user found");
      return;
    }
    const userId = res.rows[0].id;
    const userName = res.rows[0].name;
    console.log(`Trying to delete user: ${userName} (${userId})`);

    // 2. Try delete
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log("Success deleting user!");
  } catch (err) {
    console.error("FAILED to delete user:", err.message);
    if (err.detail) console.error("Detail:", err.detail);
  } finally {
    await pool.end();
  }
}

testDelete();
