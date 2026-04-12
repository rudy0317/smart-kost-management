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

// ─── AMBIL INFO AKUN USER ─────────────────────────────────────────────────────
router.get('/:id/akun', (req, res) => {
  db.query(`
    SELECT u.id, u.email, u.no_hp 
    FROM users u 
    JOIN penyewa p ON p.id_user = u.id 
    WHERE p.id = ?`, 
    [req.params.id], 
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      if (results.length === 0) return res.status(404).json({ message: 'Akun tidak ditemukan' })
      res.json(results[0])
    }
  )
})

// ─── HAPUS AKUN USER (TANPA MENGHAPUS PENYEWA ATAU SEBALIKNYA) ────────────────
router.delete('/:id/akun', (req, res) => {
  db.query('SELECT id_user FROM penyewa WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    if (results.length === 0 || !results[0].id_user) return res.status(404).json({ message: 'Penyewa tidak memiliki akun terhubung' })
    
    const id_user = results[0].id_user
    db.query('DELETE FROM users WHERE id = ?', [id_user], (err2) => {
      if (err2) return res.status(500).json({ message: 'Gagal menghapus user' })
      
      // Putuskan relasi di tabel penyewa
      db.query('UPDATE penyewa SET id_user = NULL WHERE id = ?', [req.params.id])
      res.json({ message: 'Akun login penyewa berhasil dihapus' })
    })
  })
})

module.exports = router