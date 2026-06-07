const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../dbAsync')
const AppError = require('../utils/AppError')

const JWT_SECRET = process.env.JWT_SECRET_ADMIN || 'secret_kost'

// ─── LOGIN ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body

    const [results] = await pool.query('SELECT * FROM admin WHERE username = ?', [username])
    if (results.length === 0) return res.status(401).json({ message: 'Username tidak ditemukan' })

    const admin = results[0]
    const isMatch = bcrypt.compareSync(password, admin.password)

    if (!isMatch) return res.status(401).json({ message: 'Password salah' })

    const token = jwt.sign(
      {
        id: admin.id,
        nama: admin.nama || admin.username,
        email: admin.email || '',
        username: admin.username,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({ token, message: 'Login berhasil' })
  } catch (err) {
    next(err)
  }
})

// ─── GET DATA ADMIN YANG SEDANG LOGIN (/api/auth/me) ─────────────────────────
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) throw new AppError('Token tidak ada', 401)

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) reject(new AppError('Token tidak valid', 403))
        else resolve(decoded)
      })
    })

    const [results] = await pool.query(
      'SELECT id, username, nama, email FROM admin WHERE id = ?',
      [decoded.id]
    )
    if (results.length === 0) throw new AppError('Admin tidak ditemukan', 404)

    const admin = results[0]
    res.json({
      id: admin.id,
      username: admin.username,
      nama: admin.nama || admin.username,
      email: admin.email || '-',
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
