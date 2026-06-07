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
    const { status } = req.query
    let sql = `SELECT ks.*, u.nama as nama_user FROM kritik_saran ks JOIN users u ON ks.id_user = u.id`
    const params = []
    if (status) {
      sql += ' WHERE ks.status = ?'
      params.push(status)
    }
    sql += ' ORDER BY ks.created_at DESC'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.post('/', verifyUserToken, async (req, res, next) => {
  try {
    const { isi, rating } = req.body
    if (!isi) throw new AppError('Isi kritik & saran wajib diisi', 400)

    await pool.query(
      'INSERT INTO kritik_saran (id_user, isi, rating) VALUES (?, ?, ?)',
      [req.user.id, isi, rating || 5]
    )
    res.json({ message: 'Kritik & saran berhasil dikirim' })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { status } = req.body
    const [result] = await pool.query(
      'UPDATE kritik_saran SET status = ? WHERE id = ?',
      [status, req.params.id]
    )
    if (result.affectedRows === 0) throw new AppError('Kritik & saran tidak ditemukan', 404)
    res.json({ message: 'Status berhasil diupdate' })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM kritik_saran WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) throw new AppError('Kritik & saran tidak ditemukan', 404)
    res.json({ message: 'Berhasil dihapus' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
