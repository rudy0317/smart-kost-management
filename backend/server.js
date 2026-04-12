// backend/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// 1. Middleware
app.use(cors());
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

// 4. Test Koneksi Root (Opsional)
app.get('/', (req, res) => {
  res.send('API Sistem Kost Running...');
});

// 5. Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`=========================================`);
});