# KOST ASYNC - Smart Kost Management System 🏠

KOST ASYNC adalah aplikasi manajemen kost modern yang dirancang untuk memudahkan pemilik kost (Admin) dalam mengelola kamar, penyewa, dan pembayaran, serta memberikan pengalaman booking yang seamless bagi calon penyewa (Guest).

## ✨ Fitur Utama

- **🚀 Guest Booking System**: Calon penyewa dapat melihat katalog kamar yang tersedia dan melakukan pemesanan langsung tanpa harus mendaftar akun terlebih dahulu.
- **⚡ Auto-Provisioning Account**: Sistem secara otomatis membuatkan akun penyewa (User) setelah Admin mengonfirmasi pembayaran booking. Kredensial login dikirimkan secara instan.
- **📊 Admin Dashboard**:
  - Manajemen Kamar (Status, Harga, Fasilitas).
  - Monitoring Pemesanan & Konfirmasi Pembayaran.
  - Pengelolaan Data Penyewa Aktif.
  - Laporan Keuangan & Manajemen Pengeluaran.
- **👤 Tenant Portal (User Dashboard)**:
  - Cek status kamar dan masa sewa.
  - Histori pembayaran bulanan.
  - Notifikasi tagihan.
- **🛡️ Lapis Validasi**: Validasi nomor HP (Format Indonesia 08xxx) dan keamanan password baik di sisi Frontend maupun Backend.
- **🎨 Modern UI/UX**: Desain premium dengan vibrance colors, dark mode support (on User side), dan animasi halus menggunakan Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS, Framer Motion, SweetAlert2, Lucide React.
- **Backend**: Node.js, Express.js, JWT Authentication, Bcrypt.
- **Database**: MySQL (Production ready) / SQLite (Development).

## 🚀 Cara Menjalankan Project

### 1. Clone Repository
```bash
git clone https://github.com/rudy0317/smart-kost-management.git
cd smart-kost-management
```

### 2. Setup Backend
```bash
cd backend
npm install
# Sesuaikan konfigurasi database di .env jika diperlukan
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📸 Preview Navigasi

- **Guest**: `Katalog -> Pesan Kamar -> Cek Status Pemesanan`
- **User**: `Login -> Dashboard User -> Riwayat Pembayaran`
- **Admin**: `Login Admin -> Dashboard -> Kelola Kamar/Pemesanan/Penyewa`

---
Dibuat dengan ❤️ oleh Kelompok 1 - Sistem Informasi
