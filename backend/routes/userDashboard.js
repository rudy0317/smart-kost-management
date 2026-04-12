const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const db = require('../db')

const JWT_SECRET = 'secret_kost_user'

// Middleware untuk verify token user
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

// 1. GET DETAIL PENYEWA & KAMAR + HISTORI BAYAR
router.get('/me', verifyToken, (req, res) => {
  const userId = req.user.id

  // Ambil data penyewa yang terhubung dengan id_user ini
  db.query(
    'SELECT p.*, k.nomor as nomor_kamar, k.tipe, k.harga, k.fasilitas FROM penyewa p JOIN kamar k ON p.id_kamar = k.id WHERE p.id_user = ? AND p.status = "aktif" LIMIT 1',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      
      const penyewa = results.length > 0 ? results[0] : null

      if (!penyewa) {
        // Coba cari di pemesanan (siapa tau masih pending)
        db.query(
          'SELECT pm.*, k.nomor as nomor_kamar FROM pemesanan pm JOIN kamar k ON pm.id_kamar = k.id WHERE pm.id_user = ? ORDER BY pm.id DESC LIMIT 1',
          [userId],
          (errBooking, resultsBooking) => {
            if (errBooking) return res.status(500).json({ message: 'Server error' })
            return res.json({ 
              status: 'no_active_room', 
              latest_booking: resultsBooking.length > 0 ? resultsBooking[0] : null
            })
          }
        )
        return
      }

      // Ambil histori pembayaran
      db.query(
        'SELECT * FROM pembayaran WHERE id_penyewa = ? ORDER BY created_at DESC',
        [penyewa.id],
        (errBayar, resultsBayar) => {
          if (errBayar) return res.status(500).json({ message: 'Server error parsing bayar' })
          res.json({
            status: 'active',
            penyewa: penyewa,
            histori_pembayaran: resultsBayar
          })
        }
      )
    }
  )
})

// 2. GET SEMUA PENGELUARAN PRIBADI USER
router.get('/pengeluaran', verifyToken, (req, res) => {
  const userId = req.user.id
  db.query(
    'SELECT * FROM pengeluaran_user WHERE id_user = ? ORDER BY tanggal DESC, id DESC',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      res.json(results)
    }
  )
})

// 3. TAMBAH PENGELUARAN PRIBADI
router.post('/pengeluaran', verifyToken, (req, res) => {
  const userId = req.user.id
  const { kategori, keterangan, jumlah, tanggal } = req.body

  db.query(
    'INSERT INTO pengeluaran_user (id_user, kategori, keterangan, jumlah, tanggal) VALUES (?, ?, ?, ?, ?)',
    [userId, kategori, keterangan || '', jumlah, tanggal],
    (err) => {
      if (err) return res.status(500).json({ message: 'Gagal simpan pengeluaran' })
      res.json({ message: 'Pengeluaran pribadi dicatat!' })
    }
  )
})

// 4. HAPUS PENGELUARAN PRIBADI
router.delete('/pengeluaran/:id', verifyToken, (req, res) => {
  const userId = req.user.id
  db.query(
    'DELETE FROM pengeluaran_user WHERE id = ? AND id_user = ?',
    [req.params.id, userId],
    (err) => {
      if (err) return res.status(500).json({ message: 'Gagal hapus pengeluaran' })
      res.json({ message: 'Berhasil dihapus' })
    }
  )
})

// 5. GET SEMUA KAMAR KOSONG (UNTUK PINDAH KAMAR)
router.get('/available-rooms', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM kamar WHERE status = "kosong" OR status = "tersedia" ORDER BY nomor ASC',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      res.json(results)
    }
  )
})

// 6. REQUEST PINDAH KAMAR (INSERT KE PEMESANAN)
router.post('/request-move', verifyToken, (req, res) => {
  const userId = req.user.id
  const { id_kamar, alasan } = req.body

  // Ambil data user dari penyewa aktif
  db.query(
    'SELECT * FROM penyewa WHERE id_user = ? AND status = "aktif" LIMIT 1',
    [userId],
    (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ message: 'Penyewa aktif tidak ditemukan' })
      const p = results[0]

      const sql = `INSERT INTO pemesanan (nama, no_hp, id_kamar, tanggal_masuk, id_user, status) VALUES (?, ?, ?, CURDATE(), ?, 'pending')`
      // Kita tambahkan info "Minta Pindah" di bagian nama atau bisa diolah di frontend
      const infoNama = `${p.nama} (MINTA PINDAH)`
      
      db.query(sql, [infoNama, p.no_hp, id_kamar, userId], (err) => {
        if (err) return res.status(500).json({ message: 'Gagal buat request pindah' })
        res.json({ message: 'Request pindah kamar berhasil dikirim!' })
      })
    }
  )
})

module.exports = router
