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
      CREATE TABLE IF NOT EXISTS kritik_saran (
        id INT PRIMARY KEY AUTO_INCREMENT,
        id_user INT NOT NULL,
        isi TEXT NOT NULL,
        rating INT DEFAULT 5,
        status ENUM('baru', 'dibaca') DEFAULT 'baru',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log('OK: CREATE TABLE kritik_saran')
  } catch (e) {
    console.error('Migration failed:', e)
    process.exit(1)
  }

  db.end()
  process.exit(0)
}

migrate()
