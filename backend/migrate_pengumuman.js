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
      CREATE TABLE IF NOT EXISTS pengumuman (
        id INT PRIMARY KEY AUTO_INCREMENT,
        judul VARCHAR(255) NOT NULL,
        isi TEXT NOT NULL,
        status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('OK: CREATE TABLE pengumuman')
  } catch (e) {
    console.error('Migration failed:', e)
    process.exit(1)
  }

  db.end()
  process.exit(0)
}

migrate()
