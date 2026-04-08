const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res) => {
  db.query('SELECT * FROM pengeluaran ORDER BY tanggal DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    res.json(results)
  })
})

router.post('/', (req, res) => {
  const { kategori, jumlah, tanggal, keterangan } = req.body
  db.query('INSERT INTO pengeluaran (kategori, jumlah, tanggal, keterangan) VALUES (?, ?, ?, ?)',
    [kategori, jumlah, tanggal, keterangan],
    (err) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      res.json({ message: 'Pengeluaran berhasil ditambahkan' })
    }
  )
})

router.put('/:id', (req, res) => {
  const { kategori, jumlah, tanggal, keterangan } = req.body
  db.query('UPDATE pengeluaran SET kategori=?, jumlah=?, tanggal=?, keterangan=? WHERE id=?',
    [kategori, jumlah, tanggal, keterangan, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      res.json({ message: 'Pengeluaran berhasil diupdate' })
    }
  )
})

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM pengeluaran WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    res.json({ message: 'Pengeluaran berhasil dihapus' })
  })
})


module.exports = router