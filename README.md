# KOST ASYNC - Smart Kost Management System 🏠

**KOST ASYNC** adalah platform manajemen kost modern yang mengintegrasikan sistem booking seamless bagi calon penyewa dan dashboard manajemen komprehensif bagi pemilik kost. Dirancang dengan fokus pada efisiensi operasional dan kenyamanan pengguna.

---

## ✨ Fitur Utama (Berdasarkan Role)

### 🌍 Guest (Calon Penyewa)
- **🚀 Instant Catalog**: Cek ketersediaan kamar secara real-time dengan filter harga dan fasilitas.
- **⚡ Zero-Registration Booking**: Booking kamar langsung tanpa perlu buat akun diawal.
- **🔍 Check Status**: Pantau status pembayaran dan persetujuan booking hanya dengan nomor WhatsApp.

### 👤 Tenant / User (Penyewa Aktif)
- **📊 Personal Dashboard**: Ringkasan status sewa, nomor kamar, dan fasilitas aktif.
- **📑 Digital Billing**: Histori pembayaran sewa bulanan yang transparan.
- **💸 Buku Kas Pribadi**: Fitur eksklusif untuk mencatat pengeluaran harian penyewa (listrik, makan, dll) agar keuangan terkontrol.
- **🔄 Request Pindah Kamar**: Sistem pengajuan pindah kamar ke unit yang tersedia secara digital tanpa ribet.
- **🎨 Custom UI**: Tampilan elegan dengan **Premium Dark Mode** dan interaksi halus.

### 🛡️ Admin (Pemilik Kost)
- **🎛️ Unified Command Center**: Overview bisnis lewat statistik pemesanan dan penyewa aktif.
- **✅ Payment Validation**: Konfirmasi booking dan sewa bulanan dalam sekali klik.
- **🔑 Info Akun & Auto-Provisioning**: Sistem otomatis yang meng-generate akun penyewa setelah pembayaran pertama lunas. Admin dapat mengelola kredensial di menu Info Akun.
- **🛠️ Room Management**: Kelola status kamar, harga, dan fasilitas secara dinamis.
- **📈 Financial Reports**: Laporan pemasukan dan pengeluaran operasional (Maintenance, Gaji, dll).
- **📋 Approval Pindah**: Kelola dan setujui permintaan pindah kamar penyewa dengan sinkronisasi database otomatis.

---

## 🛠️ Tech Stack & Design

Sistem ini dibangun dengan teknologi terkini untuk memastikan performa dan keamanan tinggi:

- **Frontend Core**: [React.js](https://reactjs.org/) & [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) dengan custom theme (Glassmorphism & Vibrant Elements)
- **Logic & UI**: [Framer Motion](https://www.framer.com/motion/) (Animations), [SweetAlert2](https://sweetalert2.github.io/) (Modals), [Lucide React](https://lucide.dev/) (Icons)
- **Backend**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Security**: [JSON Web Token (JWT)](https://jwt.io/) Authentication & Password Hashing (Bcrypt)
- **Database**: [SQLite](https://www.sqlite.org/) (Development) / [MySQL](https://www.mysql.com/) (Production)

---

## 🚀 Instalasi & Cara Menjalankan

### 1. Persiapan Awal
Pastikan Anda memiliki [Node.js](https://nodejs.org/) dan [Git](https://git-scm.com/) terinstall.

```bash
# Clone repository
git clone https://github.com/rudy0317/smart-kost-management.git
cd smart-kost-management
```

### 2. Konfigurasi Backend
```bash
cd backend
npm install
# Buat file .env dan sesuaikan jika perlu
# Jalankan server
npm start # atau npm run dev untuk development
```

### 3. Konfigurasi Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Keamanan & Validasi
- **Input Guard**: Validasi ketat format nomor HP Indonesia (08xxx) dan kekuatan password.
- **Route Protection**: Middleware khusus untuk memastikan Guest tidak bisa masuk area Admin/User dan sebaliknya.
- **Atomic Database Operations**: Menjamin integritas data saat terjadi update kamar atau status penyewa.

---

## 👥 Tim Pengembang
Proyek ini dikembangkan oleh **Kelompok 1 - Teknik Informatika**:
- **Rudy**: Lead Developer / Fullstack Developer
- **Yunus**: Mock Up Application
- **Dinda, Julian, dan Rizkul**: Documentation

---
© 2026 KOST ASYNC Team. All Rights Reserved.
