const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res) => {
  db.query('SELECT p.*, k.nomor as nomor_kamar FROM penyewa p LEFT JOIN kamar k ON p.id_kamar = k.id', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    res.json(results)
  })
})

router.post('/', (req, res) => {
  const { nama, no_hp, id_kamar, tanggal_masuk } = req.body
  db.query('INSERT INTO penyewa (nama, no_hp, id_kamar, tanggal_masuk) VALUES (?, ?, ?, ?)',
    [nama, no_hp, id_kamar, tanggal_masuk],
    (err) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      // update status kamar jadi terisi
      db.query('UPDATE kamar SET status = "terisi" WHERE id = ?', [id_kamar])
      res.json({ message: 'Penyewa berhasil ditambahkan' })
    }
  )
})

router.put('/:id', (req, res) => {
  const { nama, no_hp, id_kamar, tanggal_masuk } = req.body
  db.query('UPDATE penyewa SET nama=?, no_hp=?, id_kamar=?, tanggal_masuk=? WHERE id=?',
    [nama, no_hp, id_kamar, tanggal_masuk, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      res.json({ message: 'Penyewa berhasil diupdate' })
    }
  )
})

router.delete('/:id', (req, res) => {
  // ambil id_kamar dulu sebelum hapus
  db.query('SELECT id_kamar FROM penyewa WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    const id_kamar = results[0].id_kamar
    db.query('DELETE FROM penyewa WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      // update status kamar jadi kosong
      db.query('UPDATE kamar SET status = "kosong" WHERE id = ?', [id_kamar])
      res.json({ message: 'Penyewa berhasil dihapus' })
    })
  })
})

module.exports = router