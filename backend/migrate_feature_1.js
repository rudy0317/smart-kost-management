const mysql = require('mysql2')
require('dotenv').config()

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
})

const queries = [
  `ALTER TABLE kamar ADD COLUMN seri VARCHAR(10) DEFAULT 'A' AFTER id`,
  `ALTER TABLE kamar ADD COLUMN versi VARCHAR(10) DEFAULT 'v1' AFTER seri`,
  `ALTER TABLE kamar ADD COLUMN batas_kamar INT DEFAULT 1 AFTER fasilitas`,
]

async function run() {
  for (const sql of queries) {
    try {
      await conn.promise().execute(sql)
      console.log(`OK: ${sql}`)
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log(`SKIP (already exists): ${sql}`)
      } else {
        console.error(`ERROR: ${sql}`, err.message)
      }
    }
  }
  conn.end()
}

run()
