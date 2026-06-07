# TODO — Kost Async

## 🔧 Perbaikan / Penyempurnaan

- [ ] **Combo box otomatis** — seri & status kamar harus otomatis terisi berdasarkan tipe di `KamarModal.jsx` (sekarang seri read-only di create, status hanya muncul di edit)
- [ ] **Batas kamar & versi dikelompokkan** — di `KamarTable.jsx` kelompokkan juga berdasar batas_kamar dan versi, tidak hanya seri
- [ ] **Revisi ganti password** — perbaiki validasi & alur di `GantiPassword.jsx` + `routes/password.js`
- [ ] **Perbaharui pembayaran di bulan kedua** — backend udah auto-generate tagihan bulan berikutnya (`bookingService.js:70-79`), tapi user belum punya halaman untuk bayar tagihan bulan ke-2+
- [ ] **Auto-fill fasilitas berdasarkan tipe** — saat tipe kamar dipilih, fasilitas harus otomatis tercentang (udah ada `DEFAULT_BY_TIPE` di `index.jsx`, perlu dipastikan berfungsi penuh)

## 🆕 Fitur Baru

- [ ] **Pengumuman / ketentuan syarat kost** — halaman admin untuk CRUD pengumuman + ditampilkan ke user (butuh table, route, frontend baru)
- [ ] **Aturan pelanggaran** — CRUD pelanggaran untuk admin + pelaporan/user view (butuh table, route, frontend baru)
- [ ] **Input pindah kamar dipisah dari dashboard** — `PindahKamarUser.jsx` sudah独立, pastikan DashboardUser ga ada bagian pindah kamar redundan
- [ ] **Kritik & saran** — form input untuk user, tampil ke admin + halaman khusus yang munculin pengumuman
