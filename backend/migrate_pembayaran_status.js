const mysql = require('mysql2/promise')
require('dotenv').config()

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_kost',
    port: process.env.DB_PORT || 1111,
  })

  try {
    await db.query(
      `ALTER TABLE pembayaran MODIFY COLUMN status ENUM('lunas','belum','terlambat','belum_lunas','menunggu_verifikasi') DEFAULT 'belum_lunas'`
    )
    console.log('OK: Updated pembayaran status ENUM')
  } catch (e) {
    console.error('Migration failed:', e)
    process.exit(1)
  }

  db.end()
  process.exit(0)
}

migrate()
