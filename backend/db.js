const mysql2 = require('mysql2')
require('dotenv').config()

const db = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  // tanpa .promise() karena kita pakai callback, bukan async/await
})

module.exports = db