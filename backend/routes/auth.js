const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

router.post('/login', (req, res) => {
  const { username, password } = req.body

  db.query('SELECT * FROM admin WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    if (results.length === 0) return res.status(401).json({ message: 'Username tidak ditemukan' })

    const admin = results[0]
    const isMatch = bcrypt.compareSync(password, admin.password)

    if (!isMatch) return res.status(401).json({ message: 'Password salah' })

    const token = jwt.sign({ id: admin.id }, 'secret_kost', { expiresIn: '1d' })
    res.json({ token, message: 'Login berhasil' })
  })
})

module.exports = router