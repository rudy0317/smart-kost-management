const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = 'secret_kost_user';

// 1. AMBIL DAFTAR BOOKING
router.get("/", (req, res) => {
  const sql = `
    SELECT pemesanan.*, kamar.nomor AS nomor_kamar, kamar.tipe, kamar.harga
    FROM pemesanan
    JOIN kamar ON pemesanan.id_kamar = kamar.id
    ORDER BY pemesanan.id DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 2. GUEST KIRIM BOOKING
router.post("/", (req, res) => {
  const { nama, no_hp, id_kamar, tanggal_masuk } = req.body;
  
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
    return res.status(400).json({ pesan: "Format No. HP tidak valid. Harus diawali 08 dan 10–13 digit (cth: 08123456789)" })
  }

  // Cek dulu status kamar
  db.query("SELECT * FROM kamar WHERE id = ?", [id_kamar], (err, kamar) => {
    if (err || kamar.length === 0)
      return res.status(404).json({ pesan: "Kamar tidak ditemukan" });
    if (kamar[0].status === "terisi")
      return res
        .status(400)
        .json({ pesan: `Kamar ${kamar[0].nomor} sudah terisi!` });

    const sql = `INSERT INTO pemesanan (nama, no_hp, id_kamar, tanggal_masuk, id_user) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [nama, no_hp, id_kamar, tanggal_masuk, id_user], (err) => {
      if (err) return res.status(500).json({ pesan: "Gagal booking", error: err });
      res
        .status(201)
        .json({ pesan: "Booking berhasil dikirim, tunggu konfirmasi admin." });
    });
  });
});

// 3. AKSI SETUJU (TAHAP 1: Menunggu Pembayaran)
router.post("/:id/setuju", (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE pemesanan SET status = 'menunggu_pembayaran' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ pesan: "Gagal update status", error: err });
      res.json({ pesan: "Pemesanan disetujui, menunggu pembayaran dari penyewa." });
    }
  );
});

// 3.1 AKSI KONFIRMASI BAYAR (TAHAP 2: Jadi Penyewa Aktif)
router.post("/:id/konfirmasi-bayar", (req, res) => {
  const { id } = req.params;
  const { metode_bayar } = req.body; // Terima metode_bayar dari frontend

  // Step 1: Ambil data pemesan
  db.query("SELECT * FROM pemesanan WHERE id = ?", [id], (err, result) => {
    if (err || result.length === 0)
      return res.status(404).json({ pesan: "Data tidak ditemukan" });

    const data = result[0];

    // Step 2: Cek status kamar & ambil harganya
    db.query(
      "SELECT * FROM kamar WHERE id = ?",
      [data.id_kamar],
      (errKamar, kamar) => {
        if (errKamar || kamar.length === 0)
          return res.status(404).json({ pesan: "Kamar tidak ditemukan" });

        if (kamar[0].status === "terisi") {
          return res.status(400).json({ pesan: `Kamar ${kamar[0].nomor} sudah terisi!` });
        }

        // Flag untuk tracking apakah akun baru dibuat untuk guest
        let newAccountInfo = null;

        const proceedToInsertPenyewa = (userId) => {
          // Step 3: Masukkan ke tabel penyewa
          const sqlInsert = `INSERT INTO penyewa (nama, no_hp, id_kamar, tanggal_masuk, status, id_user) VALUES (?, ?, ?, ?, 'aktif', ?)`;
          db.query(
            sqlInsert,
            [data.nama, data.no_hp, data.id_kamar, data.tanggal_masuk, userId],
            (errInsert, resPenyewa) => {
              if (errInsert)
                return res.status(500).json({ pesan: "Gagal memindahkan data ke penyewa" });

              const newPenyewaId = resPenyewa.insertId;

              // Step 4: Update status kamar
              db.query("UPDATE kamar SET status = 'terisi' WHERE id = ?", [data.id_kamar], () => {
                
                // Step 5: Catat ke tabel Pembayaran
                const today = new Date().toISOString().split('T')[0];
                const bulanFormatted = data.tanggal_masuk.toISOString().substring(0, 7) + "-01";
                
                const sqlPembayaran = `
                  INSERT INTO pembayaran (id_penyewa, kategori, metode_bayar, bulan, jumlah, tanggal_bayar, status)
                  VALUES (?, 'Sewa Kamar', ?, ?, ?, ?, 'lunas')
                `;
                
                db.query(
                  sqlPembayaran, 
                  [newPenyewaId, metode_bayar || 'Tunai/Cash', bulanFormatted, kamar[0].harga, today],
                  (errPay) => {
                    if (errPay) console.log("Gagal catat pembayaran otomatis:", errPay);

                    // Step 6: Update status pemesanan
                    db.query("UPDATE pemesanan SET status = 'disetujui' WHERE id = ?", [id], () => {
                      // Kirim response dengan info akun baru jika ada (untuk guest)
                      const responseData = { 
                        pesan: "Pembayaran dikonfirmasi! Penyewa aktif & transaksi tercatat."
                      };
                      if (newAccountInfo) {
                        responseData.new_account = newAccountInfo;
                      }
                      res.json(responseData);
                    });
                  }
                );
              });
            }
          );
        };

        // Jika booking lewat guest (tanpa akun) -> buatkan akun otomatis
        if (!data.id_user) {
          const defaultPassword = data.no_hp; 
          const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
          const email = `user_${data.no_hp}@kostasync.com`;

          // Cek apakah user dengan no_hp ini sudah pernah dibuat sebelumnya
          db.query("SELECT id FROM users WHERE no_hp = ?", [data.no_hp], (errCheck, userResults) => {
            if (userResults && userResults.length > 0) {
              // Akun sudah ada, pakai ID itu (tidak buat ulang, tapi tetap kirim info)
              newAccountInfo = { email: `user_${data.no_hp}@kostasync.com`, no_hp: data.no_hp, nama: data.nama };
              proceedToInsertPenyewa(userResults[0].id);
            } else {
              // Benar-benar baru, insert ke table users
              db.query(
                "INSERT INTO users (nama, email, password, no_hp) VALUES (?, ?, ?, ?)",
                [data.nama, email, hashedPassword, data.no_hp],
                (errUser, resUser) => {
                  if (errUser) {
                    console.log("Error creating auto-user:", errUser);
                    return res.status(500).json({ pesan: "Gagal membuat akun otomatis untuk penyewa." });
                  }
                  // Simpan info akun baru untuk dikirim ke frontend
                  newAccountInfo = { email, no_hp: data.no_hp, nama: data.nama };
                  proceedToInsertPenyewa(resUser.insertId);
                }
              );
            }
          });
        } else {
          // Jika sudah punya akun (daftar manual), lanjut pakai ID yang ada
          proceedToInsertPenyewa(data.id_user);
        }
      }
    );
  });
});

// 4. AKSI TOLAK
router.put("/:id/tolak", (req, res) => {
  const { id } = req.params;
  db.query("UPDATE pemesanan SET status = 'ditolak' WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ pesan: "Pemesanan berhasil ditolak" });
  });
});

// 5. HAPUS PEMESANAN
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM pemesanan WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ pesan: "Pemesanan berhasil dihapus" });
  });
});

module.exports = router;
