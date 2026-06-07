const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const pool = require('../dbAsync')
const AppError = require('../utils/AppError')
const { pengeluaran: pengeluaranValidation, validate } = require('../utils/validation')
const withTransaction = require('../utils/transaction')

const JWT_SECRET = process.env.JWT_SECRET_USER || 'secret_kost_user'

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Akses ditolak. Token tidak ada.' })

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' })
    req.user = decoded
    next()
  })
}

router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id

    const [penyewa] = await pool.query(
      'SELECT p.*, k.nomor as nomor_kamar, k.tipe, k.harga, k.fasilitas FROM penyewa p JOIN kamar k ON p.id_kamar = k.id WHERE p.id_user = ? AND p.status = "aktif" LIMIT 1',
      [userId]
    )

    const dataPenyewa = penyewa.length > 0 ? penyewa[0] : null

    if (!dataPenyewa) {
      const [booking] = await pool.query(
        'SELECT pm.*, k.nomor as nomor_kamar FROM pemesanan pm JOIN kamar k ON pm.id_kamar = k.id WHERE pm.id_user = ? ORDER BY pm.id DESC LIMIT 1',
        [userId]
      )
      return res.json({
        status: 'no_active_room',
        latest_booking: booking.length > 0 ? booking[0] : null
      })
    }

    const [historiBayar] = await pool.query(
      'SELECT * FROM pembayaran WHERE id_penyewa = ? ORDER BY created_at DESC',
      [dataPenyewa.id]
    )

    const [pindah] = await pool.query(
      'SELECT pk.*, k.nomor as nomor_kamar_baru FROM pindah_kamar pk JOIN kamar k ON pk.id_kamar_baru = k.id WHERE pk.id_penyewa = ? ORDER BY pk.id DESC LIMIT 1',
      [dataPenyewa.id]
    )

    res.json({
      status: 'active',
      penyewa: dataPenyewa,
      histori_pembayaran: historiBayar,
      request_pindah: pindah.length > 0 ? pindah[0] : null
    })
  } catch (err) {
    next(err)
  }
})

router.get('/pengeluaran', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id
    const [rows] = await pool.query(
      'SELECT * FROM pengeluaran_user WHERE id_user = ? ORDER BY tanggal DESC, id DESC',
      [userId]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.post('/pengeluaran', verifyToken, pengeluaranValidation, validate, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { kategori, keterangan, jumlah, tanggal } = req.body

    await pool.query(
      'INSERT INTO pengeluaran_user (id_user, kategori, keterangan, jumlah, tanggal) VALUES (?, ?, ?, ?, ?)',
      [userId, kategori, keterangan || '', jumlah, tanggal]
    )
    res.json({ message: 'Pengeluaran pribadi dicatat!' })
  } catch (err) {
    next(err)
  }
})

router.delete('/pengeluaran/:id', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id
    await pool.query(
      'DELETE FROM pengeluaran_user WHERE id = ? AND id_user = ?',
      [req.params.id, userId]
    )
    res.json({ message: 'Berhasil dihapus' })
  } catch (err) {
    next(err)
  }
})

router.get('/available-rooms', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM kamar WHERE (status = "kosong" OR status = "tersedia") AND renovasi = 0 ORDER BY nomor ASC'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.post('/request-move', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { id_kamar, alasan } = req.body

    const [penyewa] = await pool.query(
      'SELECT * FROM penyewa WHERE id_user = ? AND status = "aktif" LIMIT 1',
      [userId]
    )
    if (penyewa.length === 0) throw new AppError('Penyewa aktif tidak ditemukan', 404)
    const p = penyewa[0]

    const [cekPending] = await pool.query(
      'SELECT id FROM pindah_kamar WHERE id_penyewa = ? AND status = "pending"',
      [p.id]
    )
    if (cekPending.length > 0) {
      throw new AppError('Kamu sudah memiliki pengajuan pindah kamar yang belum diproses', 400)
    }

    const sql = `INSERT INTO pindah_kamar (id_user, id_penyewa, id_kamar_lama, id_kamar_baru, alasan, status) VALUES (?, ?, ?, ?, ?, 'pending')`
    await pool.query(sql, [userId, p.id, p.id_kamar, id_kamar, alasan || ''])
    res.json({ message: 'Request pindah kamar berhasil dikirim!' })
  } catch (err) {
    next(err)
  }
})

router.get('/tagihan', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id
    const [penyewa] = await pool.query(
      'SELECT id FROM penyewa WHERE id_user = ? AND status = "aktif" LIMIT 1',
      [userId]
    )
    if (penyewa.length === 0) return res.json([])

    const [rows] = await pool.query(
      `SELECT * FROM pembayaran WHERE id_penyewa = ? AND status IN ('belum_lunas', 'menunggu_verifikasi') ORDER BY bulan DESC`,
      [penyewa[0].id]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.post('/bayar-tagihan/:id', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id
    const tagihanId = req.params.id

    const [penyewa] = await pool.query(
      'SELECT id FROM penyewa WHERE id_user = ? AND status = "aktif" LIMIT 1',
      [userId]
    )
    if (penyewa.length === 0) throw new AppError('Penyewa aktif tidak ditemukan', 404)

    const [tagihan] = await pool.query(
      'SELECT * FROM pembayaran WHERE id = ? AND id_penyewa = ? AND status = "belum_lunas"',
      [tagihanId, penyewa[0].id]
    )
    if (tagihan.length === 0) {
      throw new AppError('Tagihan tidak ditemukan atau sudah dibayar', 404)
    }

    const { metode_bayar } = req.body
    await pool.query(
      'UPDATE pembayaran SET status = "menunggu_verifikasi", metode_bayar = ? WHERE id = ?',
      [metode_bayar || 'Transfer', tagihanId]
    )
    res.json({ message: 'Pembayaran berhasil dikirim, menunggu verifikasi admin' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
