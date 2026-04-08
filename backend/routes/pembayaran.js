const express = require('express')
const router = express.Router()
const db = require('../db')

// GET SEMUA PEMBAYARAN (DENGAN JOIN NAMA & NOMOR KAMAR)
router.get('/', (req, res) => {
  const query = `
    SELECT pb.*, py.nama as nama_penyewa, k.nomor as nomor_kamar
    FROM pembayaran pb
    LEFT JOIN penyewa py ON pb.id_penyewa = py.id
    LEFT JOIN kamar k ON py.id_kamar = k.id
    ORDER BY pb.created_at DESC
  `
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error GET Pembayaran:", err)
      return res.status(500).json({ message: 'Gagal mengambil data', error: err })
    }
    res.json(results)
  })
})

// TAMBAH PEMBAYARAN BARU
router.post('/', (req, res) => {
  const { id_penyewa, kategori, metode_bayar, bulan, jumlah, tanggal_bayar, status } = req.body

  // LOGIKA BULAN: Ubah "YYYY-MM" jadi "YYYY-MM-01" agar valid di kolom DATE
  const formattedBulan = bulan.length === 7 ? `${bulan}-01` : bulan

  const query = `
    INSERT INTO pembayaran (id_penyewa, kategori, metode_bayar, bulan, jumlah, tanggal_bayar, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `

  db.query(query, [id_penyewa, kategori, metode_bayar, formattedBulan, jumlah, tanggal_bayar, status],
    (err) => {
      if (err) {
        console.error("Error POST Pembayaran:", err)
        return res.status(500).json({ message: 'Gagal simpan pembayaran', error: err })
      }
      res.json({ message: 'Pembayaran berhasil dicatat' })
    }
  )
})

// UPDATE PEMBAYARAN
router.put('/:id', (req, res) => {
  const { id_penyewa, kategori, metode_bayar, bulan, jumlah, tanggal_bayar, status } = req.body

  // LOGIKA BULAN: Sama kayak di atas, pastiin formatnya YYYY-MM-01
  const formattedBulan = bulan.length === 7 ? `${bulan}-01` : bulan

  const query = `
    UPDATE pembayaran
    SET id_penyewa=?, kategori=?, metode_bayar=?, bulan=?, jumlah=?, tanggal_bayar=?, status=?
    WHERE id=?
  `

  db.query(query, [id_penyewa, kategori, metode_bayar, formattedBulan, jumlah, tanggal_bayar, status, req.params.id],
    (err) => {
      if (err) {
        console.error("Error PUT Pembayaran:", err)
        return res.status(500).json({ message: 'Gagal update pembayaran', error: err })
      }
      res.json({ message: 'Pembayaran berhasil diperbarui' })
    }
  )
})

// HAPUS PEMBAYARAN
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM pembayaran WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      console.error("Error DELETE Pembayaran:", err)
      return res.status(500).json({ message: 'Gagal hapus data', error: err })
    }
    res.json({ message: 'Data pembayaran telah dihapus' })
  })
})

module.exports = router