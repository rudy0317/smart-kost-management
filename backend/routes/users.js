const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../dbAsync')
const AppError = require('../utils/AppError')
const { registerUser, validate } = require('../utils/validation')

const JWT_SECRET = process.env.JWT_SECRET_USER || 'secret_kost_user'

// ─── REGISTER USER ────────────────────────────────────────────────────────────
router.post('/register', registerUser, validate, async (req, res, next) => {
  try {
    const { nama, email, password, no_hp } = req.body

    // Cek email sudah terdaftar belum
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) throw new AppError('Email sudah terdaftar', 409)

    const hashedPassword = bcrypt.hashSync(password, 10)

    const [result] = await pool.query(
      'INSERT INTO users (nama, email, password, no_hp) VALUES (?, ?, ?, ?)',
      [nama, email, hashedPassword, no_hp || null]
    )

    const token = jwt.sign(
      { id: result.insertId, nama, email, no_hp: no_hp || '', role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, message: 'Registrasi berhasil' })
  } catch (err) {
    next(err)
  }
})

// ─── LOGIN USER ───────────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new AppError('Email/No. HP dan password wajib diisi', 400)
    }

    // Cari berdasarkan email ATAU no_hp
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? OR no_hp = ?', [email, email])
    if (users.length === 0) throw new AppError('Akun tidak ditemukan', 401)

    const user = users[0]
    const isMatch = bcrypt.compareSync(password, user.password)

    if (!isMatch) throw new AppError('Password salah', 401)

    const token = jwt.sign(
      { id: user.id, nama: user.nama, email: user.email, no_hp: user.no_hp || '', role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, message: 'Login berhasil' })
  } catch (err) {
    next(err)
  }
})

// ─── GET DATA USER YANG LOGIN (/api/users/me) ─────────────────────────────────
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

    const [users] = await pool.query(
      'SELECT id, nama, email, no_hp FROM users WHERE id = ?',
      [decoded.id]
    )
    if (users.length === 0) throw new AppError('User tidak ditemukan', 404)

    res.json({ ...users[0], role: 'user' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
