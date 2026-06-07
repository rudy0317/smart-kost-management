const express = require('express')
const router = express.Router()
const pool = require('../dbAsync')
const { pengeluaran: pengeluaranValidation, validate } = require('../utils/validation')

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pengeluaran ORDER BY tanggal DESC')
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.post('/', pengeluaranValidation, validate, async (req, res, next) => {
  try {
    const { kategori, jumlah, tanggal, keterangan } = req.body
    await pool.query(
      'INSERT INTO pengeluaran (kategori, jumlah, tanggal, keterangan) VALUES (?, ?, ?, ?)',
      [kategori, jumlah, tanggal, keterangan]
    )
    res.json({ message: 'Pengeluaran berhasil ditambahkan' })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { kategori, jumlah, tanggal, keterangan } = req.body
    await pool.query(
      'UPDATE pengeluaran SET kategori=?, jumlah=?, tanggal=?, keterangan=? WHERE id=?',
      [kategori, jumlah, tanggal, keterangan, req.params.id]
    )
    res.json({ message: 'Pengeluaran berhasil diupdate' })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM pengeluaran WHERE id = ?', [req.params.id])
    res.json({ message: 'Pengeluaran berhasil dihapus' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
