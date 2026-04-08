const express = require('express')
const cors = require('cors')
const db = require('./db')
const authRoutes = require('./routes/auth')
const dashboardRoutes = require('./routes/dashboard')
const kamarRoutes = require('./routes/kamar')
const penyewaRoutes = require('./routes/penyewa')
const pembayaranRoutes = require('./routes/pembayaran')
const pengeluaranRoutes = require('./routes/pengeluaran')
const laporanRoutes = require('./routes/laporan')
const pemesananRoutes = require('./routes/pemesanan')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/kamar', kamarRoutes)
app.use('/api/penyewa', penyewaRoutes)
app.use('/api/pembayaran', pembayaranRoutes)
app.use('/api/pengeluaran', pengeluaranRoutes)
app.use('/api/pemesanan', pemesananRoutes)
app.use('/api/laporan', laporanRoutes)

app.listen(5000, () => {
  console.log('Server running di port 5000')
})

// --- API UNTUK PEMESANAN PUBLIK ---

app.post('/api/pemesanan', (req, res) => {
  const { nama, no_hp, id_kamar, tanggal_masuk } = req.body;

  // Langkah 1: Masukkan data pemesan ke tabel penyewa
  const sqlInsertPenyewa = `INSERT INTO penyewa (nama, no_hp, id_kamar, tanggal_masuk, status) VALUES (?, ?, ?, ?, 'aktif')`;

  db.query(sqlInsertPenyewa, [nama, no_hp, id_kamar, tanggal_masuk], (err, result) => {
    if (err) {
      console.error('Error saat menyimpan penyewa:', err);
      return res.status(500).json({ pesan: 'Gagal memproses pemesanan.' });
    }

    // Langkah 2: Jika berhasil jadi penyewa, update status kamar menjadi 'terisi'
    const sqlUpdateKamar = `UPDATE kamar SET status = 'terisi' WHERE id = ?`;

    db.query(sqlUpdateKamar, [id_kamar], (errUpdate, resultUpdate) => {
      if (errUpdate) {
        console.error('Error saat update status kamar:', errUpdate);
        return res.status(500).json({ pesan: 'Gagal mengupdate status kamar.' });
      }

      // Jika kedua proses sukses, kirim balasan ke React
      res.status(201).json({ pesan: 'Pemesanan berhasil, kamar sekarang terisi!' });
    });
  });
});