// backend/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// 1. Middleware
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173']

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json()); // Supaya bisa baca req.body dari frontend

// 2. Import Semua Routes dari Folder ./routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const kamarRoutes = require('./routes/kamar');
const laporanRoutes = require('./routes/laporan');
const pembayaranRoutes = require('./routes/pembayaran');
const pemesananRoutes = require('./routes/pemesanan');
const pengeluaranRoutes = require('./routes/pengeluaran');
const penyewaRoutes = require('./routes/penyewa');
const usersRoutes = require('./routes/users');
const userDashboardRoutes = require('./routes/userDashboard');
const pindahKamarRoutes = require('./routes/pindahKamar');
const passwordRoutes = require('./routes/password');
const pengumumanRoutes = require('./routes/pengumuman');
const pelanggaranRoutes = require('./routes/pelanggaran');
const kritikSaranRoutes = require('./routes/kritikSaran');

// 3. Daftarkan Route ke Path API
// Ini artinya: kalau frontend panggil /api/kamar, dia bakal lari ke file routes/kamar.js
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/kamar', kamarRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/pemesanan', pemesananRoutes);
app.use('/api/pengeluaran', pengeluaranRoutes);
app.use('/api/penyewa', penyewaRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/user-dashboard', userDashboardRoutes);
app.use('/api/pindah-kamar', pindahKamarRoutes);
app.use('/api/users/password', passwordRoutes);
app.use('/api/pengumuman', pengumumanRoutes);
app.use('/api/pelanggaran', pelanggaranRoutes);
app.use('/api/kritik-saran', kritikSaranRoutes);

// 4. Test Koneksi Root (Opsional)
app.get('/', (req, res) => {
  res.send('API Sistem Kost Running...');
});

// 4a. Global Error Middleware (harus setelah routes)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan server'
  });
});

// 5. Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`=========================================`);
});