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
    const [cols] = await db.query('SHOW COLUMNS FROM kamar LIKE ?', ['renovasi'])
    if (cols.length === 0) {
      await db.query('ALTER TABLE kamar ADD COLUMN renovasi TINYINT(1) DEFAULT 0 AFTER fasilitas')
      console.log('OK: ADD COLUMN renovasi')
    } else {
      console.log('SKIP: renovasi already exists')
    }

    const [cols2] = await db.query('SHOW COLUMNS FROM kamar LIKE ?', ['versi'])
    if (cols2.length > 0) {
      await db.query('UPDATE kamar SET renovasi = 0 WHERE renovasi IS NULL')
      await db.query('ALTER TABLE kamar DROP COLUMN versi')
      console.log('OK: DROP COLUMN versi')
    } else {
      console.log('SKIP: versi already dropped')
    }
  } catch (e) {
    console.error('Migration failed:', e)
    process.exit(1)
  }

  db.end()
  process.exit(0)
}

migrate()
