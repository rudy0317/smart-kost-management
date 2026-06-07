const express = require('express')
const router = express.Router()
const pool = require('../dbAsync')
const AppError = require('../utils/AppError')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET_USER || 'secret_kost_user'

const verifyUserToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Akses ditolak. Token tidak ada.' })
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' })
    req.user = decoded
    next()
  })
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pelanggaran ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pelanggaran WHERE id = ?', [req.params.id])
    if (rows.length === 0) throw new AppError('Pelanggaran tidak ditemukan', 404)
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { nama, deskripsi, sanksi } = req.body
    if (!nama) throw new AppError('Nama pelanggaran wajib diisi', 400)

    const [result] = await pool.query(
      'INSERT INTO pelanggaran (nama, deskripsi, sanksi) VALUES (?, ?, ?)',
      [nama, deskripsi || '', sanksi || '']
    )
    res.json({ message: 'Pelanggaran berhasil ditambahkan', id: result.insertId })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { nama, deskripsi, sanksi } = req.body
    const [result] = await pool.query(
      'UPDATE pelanggaran SET nama=?, deskripsi=?, sanksi=? WHERE id=?',
      [nama, deskripsi, sanksi, req.params.id]
    )
    if (result.affectedRows === 0) throw new AppError('Pelanggaran tidak ditemukan', 404)
    res.json({ message: 'Pelanggaran berhasil diupdate' })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM pelanggaran WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) throw new AppError('Pelanggaran tidak ditemukan', 404)
    res.json({ message: 'Pelanggaran berhasil dihapus' })
  } catch (err) {
    next(err)
  }
})

router.get('/laporan/all', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT lp.*, u.nama as nama_user, p.nama as nama_pelanggaran
       FROM laporan_pelanggaran lp
       JOIN users u ON lp.id_user = u.id
       JOIN pelanggaran p ON lp.id_pelanggaran = p.id
       ORDER BY lp.created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.put('/laporan/:id', async (req, res, next) => {
  try {
    const { status } = req.body
    const [result] = await pool.query(
      'UPDATE laporan_pelanggaran SET status = ? WHERE id = ?',
      [status, req.params.id]
    )
    if (result.affectedRows === 0) throw new AppError('Laporan tidak ditemukan', 404)
    res.json({ message: 'Status laporan berhasil diupdate' })
  } catch (err) {
    next(err)
  }
})

router.post('/laporan', verifyUserToken, async (req, res, next) => {
  try {
    const { id_pelanggaran, deskripsi } = req.body
    if (!id_pelanggaran) throw new AppError('Pilih pelanggaran yang dilaporkan', 400)

    await pool.query(
      'INSERT INTO laporan_pelanggaran (id_user, id_pelanggaran, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, id_pelanggaran, deskripsi || '']
    )
    res.json({ message: 'Laporan pelanggaran berhasil dikirim' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
