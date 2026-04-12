const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

const JWT_SECRET = 'secret_kost_user'

// ─── REGISTER USER ────────────────────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { nama, email, password, no_hp } = req.body

  if (!nama || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' })
  }

  // Validasi format No. HP (08... 10-13 digit)
  const phoneRegex = /^08[0-9]{8,11}$/
  if (no_hp && !phoneRegex.test(no_hp)) {
    return res.status(400).json({ message: 'Format Nomor HP tidak valid (Wajib 08... dan 10-13 digit)' })
  }

  // Validasi panjang password
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password minimal 8 karakter' })
  }

  // Cek email sudah terdaftar belum
  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    if (results.length > 0) return res.status(409).json({ message: 'Email sudah terdaftar' })

    const hashedPassword = bcrypt.hashSync(password, 10)

    db.query(
      'INSERT INTO users (nama, email, password, no_hp) VALUES (?, ?, ?, ?)',
      [nama, email, hashedPassword, no_hp || null],
      (insertErr, result) => {
        if (insertErr) return res.status(500).json({ message: 'Gagal mendaftar' })

        const token = jwt.sign(
          { id: result.insertId, nama, email, no_hp: no_hp || '', role: 'user' },
          JWT_SECRET,
          { expiresIn: '7d' }
        )

        res.status(201).json({ token, message: 'Registrasi berhasil' })
      }
    )
  })
})

// ─── LOGIN USER ───────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body // 'email' field can now contain either email or phone

  if (!email || !password) {
    return res.status(400).json({ message: 'Email/No. HP dan password wajib diisi' })
  }

  // Cari berdasarkan email ATAU no_hp
  db.query('SELECT * FROM users WHERE email = ? OR no_hp = ?', [email, email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    if (results.length === 0) return res.status(401).json({ message: 'Akun tidak ditemukan' })

    const user = results[0]
    const isMatch = bcrypt.compareSync(password, user.password)

    if (!isMatch) return res.status(401).json({ message: 'Password salah' })

    const token = jwt.sign(
      { id: user.id, nama: user.nama, email: user.email, no_hp: user.no_hp || '', role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, message: 'Login berhasil' })
  })
})

// ─── GET DATA USER YANG LOGIN (/api/users/me) ─────────────────────────────────
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ message: 'Token tidak ada' })

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' })

    db.query(
      'SELECT id, nama, email, no_hp FROM users WHERE id = ?',
      [decoded.id],
      (dbErr, results) => {
        if (dbErr) return res.status(500).json({ message: 'Server error' })
        if (results.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' })

        res.json({ ...results[0], role: 'user' })
      }
    )
  })
})

module.exports = router
