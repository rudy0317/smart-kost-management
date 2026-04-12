const mysql = require('mysql2/promise')
require('dotenv').config()

async function migrate() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'db_kost',
            port: process.env.DB_PORT || 1111
        })
        
        const sql = `
            CREATE TABLE IF NOT EXISTS pindah_kamar (
                id INT PRIMARY KEY AUTO_INCREMENT,
                id_user INT NOT NULL,
                id_penyewa INT NOT NULL,
                id_kamar_lama INT NOT NULL,
                id_kamar_baru INT NOT NULL,
                alasan TEXT,
                status ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `
        await db.query(sql)
        console.log("Migration success: Table pindah_kamar created!")
        process.exit(0)
    } catch (e) {
        console.error("Migration failed: ", e)
        process.exit(1)
    }
}
migrate()
