const express = require('express')
const router = express.Router()
const pool = require('../dbAsync')
const { pembayaran: pembayaranValidation, validate } = require('../utils/validation')

// GET SEMUA PEMBAYARAN (DENGAN JOIN NAMA & NOMOR KAMAR)
router.get('/', async (req, res, next) => {
  try {
    const query = `
      SELECT pb.*, py.nama as nama_penyewa, k.nomor as nomor_kamar
      FROM pembayaran pb
      LEFT JOIN penyewa py ON pb.id_penyewa = py.id
      LEFT JOIN kamar k ON py.id_kamar = k.id
      ORDER BY pb.created_at DESC
    `
    const [rows] = await pool.query(query)
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// TAMBAH PEMBAYARAN BARU
router.post('/', pembayaranValidation, validate, async (req, res, next) => {
  try {
    const { id_penyewa, kategori, metode_bayar, bulan, jumlah, tanggal_bayar, status } = req.body

    const formattedBulan = bulan.length === 7 ? `${bulan}-01` : bulan

    const query = `
      INSERT INTO pembayaran (id_penyewa, kategori, metode_bayar, bulan, jumlah, tanggal_bayar, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    await pool.query(query, [id_penyewa, kategori, metode_bayar, formattedBulan, jumlah, tanggal_bayar, status])
    res.json({ message: 'Pembayaran berhasil dicatat' })
  } catch (err) {
    next(err)
  }
})

// UPDATE PEMBAYARAN
router.put('/:id', async (req, res, next) => {
  try {
    const { id_penyewa, kategori, metode_bayar, bulan, jumlah, tanggal_bayar, status } = req.body

    const formattedBulan = bulan.length === 7 ? `${bulan}-01` : bulan

    const query = `
      UPDATE pembayaran
      SET id_penyewa=?, kategori=?, metode_bayar=?, bulan=?, jumlah=?, tanggal_bayar=?, status=?
      WHERE id=?
    `
    await pool.query(query, [id_penyewa, kategori, metode_bayar, formattedBulan, jumlah, tanggal_bayar, status, req.params.id])
    res.json({ message: 'Pembayaran berhasil diperbarui' })
  } catch (err) {
    next(err)
  }
})

// VERIFIKASI PEMBAYARAN (admin menyetujui)
router.patch('/:id/verify', async (req, res, next) => {
  try {
    const [pembayaran] = await pool.query(
      'SELECT * FROM pembayaran WHERE id = ? AND status = "menunggu_verifikasi"',
      [req.params.id]
    )
    if (pembayaran.length === 0) {
      throw new AppError('Pembayaran tidak ditemukan atau sudah diverifikasi', 404)
    }

    await pool.query(
      'UPDATE pembayaran SET status = "lunas", tanggal_bayar = CURDATE() WHERE id = ?',
      [req.params.id]
    )
    res.json({ message: 'Pembayaran berhasil diverifikasi' })
  } catch (err) {
    next(err)
  }
})

// HAPUS PEMBAYARAN
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM pembayaran WHERE id = ?', [req.params.id])
    res.json({ message: 'Data pembayaran telah dihapus' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
