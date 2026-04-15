const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'seat_booking',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Vasu8854@2004',
});

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Database reset complete! All bookings cleared.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }
}

resetDatabase();
