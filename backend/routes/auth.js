const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

const JWT_SECRET = 'secret_kost'

// ─── LOGIN ───────────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { username, password } = req.body

  db.query('SELECT * FROM admin WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    if (results.length === 0) return res.status(401).json({ message: 'Username tidak ditemukan' })

    const admin = results[0]
    const isMatch = bcrypt.compareSync(password, admin.password)

    if (!isMatch) return res.status(401).json({ message: 'Password salah' })

    // Simpan id, nama, email, username ke dalam token
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
  })
})

// ─── GET DATA ADMIN YANG SEDANG LOGIN (/api/auth/me) ─────────────────────────
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (!token) return res.status(401).json({ message: 'Token tidak ada' })

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' })

    // Ambil data terbaru dari DB berdasarkan id di token
    db.query(
      'SELECT id, username, nama, email FROM admin WHERE id = ?',
      [decoded.id],
      (dbErr, results) => {
        if (dbErr) return res.status(500).json({ message: 'Server error' })
        if (results.length === 0) return res.status(404).json({ message: 'Admin tidak ditemukan' })

        const admin = results[0]
        res.json({
          id: admin.id,
          username: admin.username,
          nama: admin.nama || admin.username,
          email: admin.email || '-',
        })
      }
    )
  })
})

module.exports = router