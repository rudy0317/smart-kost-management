const express = require("express");
const router = express.Router();
const pool = require("../dbAsync");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const bookingService = require("../services/bookingService");
const { pemesanan: pemesananValidation, validate } = require("../utils/validation");
const JWT_SECRET = process.env.JWT_SECRET_USER || 'secret_kost_user';

// 1. AMBIL DAFTAR BOOKING
router.get("/", async (req, res, next) => {
  try {
    const sql = `
      SELECT pemesanan.*, kamar.nomor AS nomor_kamar, kamar.tipe, kamar.harga
      FROM pemesanan
      JOIN kamar ON pemesanan.id_kamar = kamar.id
      ORDER BY pemesanan.id DESC
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 2. GUEST KIRIM BOOKING
router.post("/", pemesananValidation, validate, async (req, res, next) => {
  try {
    const { nama, no_hp, id_kamar, tanggal_masuk, metode_bayar, kode_unik } = req.body;

    // Ekstrak id_user dari token jika ada
    let id_user = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        if (token && token !== "null" && token !== "undefined") {
          const decoded = jwt.verify(token, JWT_SECRET);
          id_user = decoded.id;
        }
      } catch (e) {
        console.log("Token invalid in pemesanan:", e.message);
      }
    }

    // Validasi No. HP: wajib diawali 08, panjang 10-13 digit
    const phoneRegex = /^08[0-9]{8,11}$/
    if (!phoneRegex.test(no_hp)) {
      throw new AppError("Format No. HP tidak valid. Harus diawali 08 dan 10–13 digit (cth: 08123456789)", 400)
    }

    // Cek dulu status kamar
    const [kamar] = await pool.query("SELECT * FROM kamar WHERE id = ?", [id_kamar]);
    if (kamar.length === 0)
      throw new AppError("Kamar tidak ditemukan", 404);
    if (kamar[0].status === "terisi")
      throw new AppError(`Kamar ${kamar[0].nomor} sudah terisi!`, 400);

    const sql = `INSERT INTO pemesanan (nama, no_hp, id_kamar, tanggal_masuk, id_user, metode_bayar, kode_unik) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await pool.query(sql, [nama, no_hp, id_kamar, tanggal_masuk, id_user, metode_bayar || 'Tunai/Cash', kode_unik || 0]);
    res.status(201).json({ pesan: "Booking berhasil dikirim, tunggu konfirmasi admin." });
  } catch (err) {
    next(err);
  }
});

// 3. AKSI SETUJU (TAHAP 1: Menunggu Pembayaran)
router.post("/:id/setuju", async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE pemesanan SET status = 'menunggu_pembayaran' WHERE id = ?",
      [id]
    );
    res.json({ pesan: "Pemesanan disetujui, menunggu pembayaran dari penyewa." });
  } catch (err) {
    next(err);
  }
});

// 3.1 AKSI KONFIRMASI BAYAR (TAHAP 2: Jadi Penyewa Aktif)
router.post("/:id/konfirmasi-bayar", async (req, res, next) => {
  try {
    const result = await bookingService.confirmPayment(req.params.id, req.body.metode_bayar);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 3.2 GUEST SINYAL BAYAR (Simulasi Selesai Bayar)
router.put("/:id/sinyal-bayar", async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE pemesanan SET status = 'menunggu_verifikasi' WHERE id = ?",
      [id]
    );
    res.json({ pesan: "Pemesanan diperbarui, mohon tunggu verifikasi admin." });
  } catch (err) {
    next(err);
  }
});

// 4. AKSI TOLAK
router.put("/:id/tolak", async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE pemesanan SET status = 'ditolak' WHERE id = ?", [id]);
    res.json({ pesan: "Pemesanan berhasil ditolak" });
  } catch (err) {
    next(err);
  }
});

// 5. HAPUS PEMESANAN
router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM pemesanan WHERE id = ?", [req.params.id]);
    res.json({ pesan: "Pemesanan berhasil dihapus" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
