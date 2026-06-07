const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../dbAsync')
const AppError = require('../utils/AppError')

const USER_SECRET = process.env.JWT_SECRET_USER || 'secret_kost_user'
const ADMIN_SECRET = process.env.JWT_SECRET_ADMIN || 'secret_kost'

function getSecretFromToken(token) {
  try {
    jwt.verify(token, USER_SECRET)
    return { secret: USER_SECRET, role: 'user' }
  } catch {
    try {
      jwt.verify(token, ADMIN_SECRET)
      return { secret: ADMIN_SECRET, role: 'admin' }
    } catch {
      return null
    }
  }
}

router.put('/', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) throw new AppError('Token tidak ada', 401)

    const tokenInfo = getSecretFromToken(token)
    if (!tokenInfo) throw new AppError('Token tidak valid', 403)

    const decoded = jwt.verify(token, tokenInfo.secret)

    const { current_password, new_password } = req.body
    if (!current_password || !new_password) {
      throw new AppError('Password lama dan baru wajib diisi', 400)
    }
    if (new_password.length < 8) {
      throw new AppError('Password baru minimal 8 karakter', 400)
    }

    if (tokenInfo.role === 'admin') {
      const [admins] = await pool.query('SELECT * FROM admin WHERE id = ?', [decoded.id])
      if (admins.length === 0) throw new AppError('Admin tidak ditemukan', 404)
      const isMatch = bcrypt.compareSync(current_password, admins[0].password)
      if (!isMatch) throw new AppError('Password lama salah', 400)
      const hashed = bcrypt.hashSync(new_password, 10)
      await pool.query('UPDATE admin SET password = ? WHERE id = ?', [hashed, decoded.id])
    } else {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id])
      if (users.length === 0) throw new AppError('User tidak ditemukan', 404)
      const isMatch = bcrypt.compareSync(current_password, users[0].password)
      if (!isMatch) throw new AppError('Password lama salah', 400)
      const hashed = bcrypt.hashSync(new_password, 10)
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, decoded.id])
    }

    res.json({ message: 'Password berhasil diganti!' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
