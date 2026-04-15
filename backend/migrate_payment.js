const db = require('mysql2').createConnection({
  host: '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_kost',
  port: process.env.DB_PORT || 1111
});

const sql1 = "ALTER TABLE pemesanan ADD COLUMN metode_bayar VARCHAR(50) DEFAULT 'Tunai/Cash' AFTER tanggal_masuk";
const sql2 = "ALTER TABLE pemesanan ADD COLUMN kode_unik INT DEFAULT 0 AFTER metode_bayar";

console.log('Running migrations...');

db.query(sql1, (err) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column metode_bayar already exists.');
        } else {
            console.error('Error adding metode_bayar:', err);
        }
    } else {
        console.log('Column metode_bayar added successfully.');
    }

    db.query(sql2, (err) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column kode_unik already exists.');
            } else {
                console.error('Error adding kode_unik:', err);
            }
        } else {
            console.log('Column kode_unik added successfully.');
        }
        process.exit();
    });
});
