const express = require('express')
const router = express.Router()
const pool = require('../dbAsync')
const AppError = require('../utils/AppError')

router.get('/', async (req, res, next) => {
  try {
    const { status, limit } = req.query
    let sql = 'SELECT * FROM pengumuman'
    const params = []
    const conditions = []

    if (status) {
      conditions.push('status = ?')
      params.push(status)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY created_at DESC'

    if (limit) {
      sql += ' LIMIT ?'
      params.push(parseInt(limit))
    }

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pengumuman WHERE id = ?', [req.params.id])
    if (rows.length === 0) throw new AppError('Pengumuman tidak ditemukan', 404)
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { judul, isi, status } = req.body
    if (!judul || !isi) throw new AppError('Judul dan isi wajib diisi', 400)

    const [result] = await pool.query(
      'INSERT INTO pengumuman (judul, isi, status) VALUES (?, ?, ?)',
      [judul, isi, status || 'aktif']
    )
    res.json({ message: 'Pengumuman berhasil ditambahkan', id: result.insertId })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { judul, isi, status } = req.body
    const [result] = await pool.query(
      'UPDATE pengumuman SET judul=?, isi=?, status=? WHERE id=?',
      [judul, isi, status, req.params.id]
    )
    if (result.affectedRows === 0) throw new AppError('Pengumuman tidak ditemukan', 404)
    res.json({ message: 'Pengumuman berhasil diupdate' })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM pengumuman WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) throw new AppError('Pengumuman tidak ditemukan', 404)
    res.json({ message: 'Pengumuman berhasil dihapus' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
