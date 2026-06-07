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
    await db.query(`
      CREATE TABLE IF NOT EXISTS kamar_limits (
        seri VARCHAR(10) PRIMARY KEY,
        tipe VARCHAR(50) NOT NULL,
        max_kamar INT NOT NULL
      )
    `)
    console.log('OK: CREATE TABLE kamar_limits')

    await db.query(`INSERT IGNORE INTO kamar_limits (seri, tipe, max_kamar) VALUES ('A', 'Standard', 15)`)
    await db.query(`INSERT IGNORE INTO kamar_limits (seri, tipe, max_kamar) VALUES ('B', 'Premium', 10)`)
    await db.query(`INSERT IGNORE INTO kamar_limits (seri, tipe, max_kamar) VALUES ('C', 'VIP', 5)`)
    console.log('OK: Seed kamar_limits (Reg=15, Prem=10, VIP=5)')
  } catch (e) {
    console.error('Migration failed:', e)
    process.exit(1)
  }

  db.end()
  process.exit(0)
}

migrate()
