const express = require("express");
const router = express.Router();
const db = require("../db");

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

  // Cek dulu status kamar
  db.query("SELECT * FROM kamar WHERE id = ?", [id_kamar], (err, kamar) => {
    if (err || kamar.length === 0)
      return res.status(404).json({ pesan: "Kamar tidak ditemukan" });
    if (kamar[0].status === "terisi")
      return res
        .status(400)
        .json({ pesan: `Kamar ${kamar[0].nomor} sudah terisi!` });

    const sql = `INSERT INTO pemesanan (nama, no_hp, id_kamar, tanggal_masuk) VALUES (?, ?, ?, ?)`;
    db.query(sql, [nama, no_hp, id_kamar, tanggal_masuk], (err) => {
      if (err) return res.status(500).json({ pesan: "Gagal booking" });
      res
        .status(201)
        .json({ pesan: "Booking berhasil dikirim, tunggu konfirmasi admin." });
    });
  });
});

// 3. AKSI SETUJU
router.post("/:id/setuju", (req, res) => {
  const { id } = req.params;

  // Step 1: Ambil data pemesan
  db.query("SELECT * FROM pemesanan WHERE id = ?", [id], (err, result) => {
    if (err || result.length === 0)
      return res.status(404).json({ pesan: "Data tidak ditemukan" });

    const data = result[0];

    // Step 2: Cek status kamar dulu
    db.query(
      "SELECT * FROM kamar WHERE id = ?",
      [data.id_kamar],
      (errKamar, kamar) => {
        if (errKamar || kamar.length === 0)
          return res.status(404).json({ pesan: "Kamar tidak ditemukan" });

        if (kamar[0].status === "terisi") {
          return res
            .status(400)
            .json({
              pesan: `Kamar ${kamar[0].nomor} sudah terisi, pemesanan tidak bisa disetujui!`,
            });
        }

        // Step 3: Masukkan ke tabel penyewa
        const sqlInsert = `INSERT INTO penyewa (nama, no_hp, id_kamar, tanggal_masuk, status) VALUES (?, ?, ?, ?, 'aktif')`;
        db.query(
          sqlInsert,
          [data.nama, data.no_hp, data.id_kamar, data.tanggal_masuk],
          (errInsert) => {
            if (errInsert)
              return res
                .status(500)
                .json({ pesan: "Gagal memindahkan data ke penyewa" });

            // Step 4: Update status kamar jadi terisi
            db.query(
              "UPDATE kamar SET status = 'terisi' WHERE id = ?",
              [data.id_kamar],
              (errUpdate) => {
                if (errUpdate)
                  return res
                    .status(500)
                    .json({ pesan: "Gagal update status kamar" });

                // Step 5: Update status pemesanan jadi disetujui
                db.query(
                  "UPDATE pemesanan SET status = 'disetujui' WHERE id = ?",
                  [id],
                  (errStatus) => {
                    if (errStatus)
                      return res
                        .status(500)
                        .json({ pesan: "Gagal update status pemesanan" });

                    // Step 6: Tolak otomatis pemesanan lain yang kamarnya sama
                    db.query(
                      "UPDATE pemesanan SET status = 'ditolak' WHERE id_kamar = ? AND status = 'pending'",
                      [data.id_kamar],
                      () => {
                        res.json({
                          pesan: "Pemesanan disetujui, kamar otomatis terisi!",
                        });
                      },
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  });
});

// 4. AKSI TOLAK
router.put("/:id/tolak", (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE pemesanan SET status = 'ditolak' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ pesan: "Pemesanan berhasil ditolak" });
    },
  );
});

// 5. HAPUS PEMESANAN
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM pemesanan WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ pesan: "Pemesanan berhasil dihapus" });
  });
});

module.exports = router;
