const mysql2 = require('mysql2');
require('dotenv').config();

const db = mysql2.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_kost',
  port: process.env.DB_PORT || 1111
});

const sql = `
  ALTER TABLE pemesanan 
  MODIFY COLUMN status ENUM('pending', 'menunggu_pembayaran', 'menunggu_verifikasi', 'disetujui', 'ditolak') 
  DEFAULT 'pending'
`;

console.log('--- MIGRATION START ---');
console.log('Updating "status" ENUM for table "pemesanan"...');

db.connect((err) => {
  if (err) {
    console.error('Koneksi database gagal:', err);
    process.exit(1);
  }

  db.query(sql, (error) => {
    if (error) {
      console.error('Error saat migrasi:', error);
    } else {
      console.log('✅ Status ENUM berhasil diperbarui ke: pending, menunggu_pembayaran, menunggu_verifikasi, disetujui, ditolak');
    }
    db.end();
    console.log('--- MIGRATION END ---');
    process.exit();
  });
});
