const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res) => {
  db.query('SELECT * FROM kamar', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    res.json(results)
  })
})

router.post('/', (req, res) => {
  const { nomor, tipe, harga, fasilitas } = req.body
  db.query('INSERT INTO kamar (nomor, tipe, harga, fasilitas) VALUES (?, ?, ?, ?)',
    [nomor, tipe, harga, fasilitas],
    (err) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      res.json({ message: 'Kamar berhasil ditambahkan' })
    }
  )
})

router.put('/:id', (req, res) => {
  const { nomor, tipe, harga, fasilitas, status } = req.body

  // Kalau mau diubah jadi kosong, cek dulu ada penyewa aktif ga
  if (status === 'kosong') {
    db.query(
      'SELECT * FROM penyewa WHERE id_kamar = ? AND status = "aktif"',
      [req.params.id],
      (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' })
        if (results.length > 0) {
          return res.status(400).json({
            message: `Kamar masih ditempati oleh ${results[0].nama}. Keluarkan penyewa terlebih dahulu.`
          })
        }

        // Aman, tidak ada penyewa aktif
        db.query(
          'UPDATE kamar SET nomor=?, tipe=?, harga=?, fasilitas=?, status=? WHERE id=?',
          [nomor, tipe, harga, fasilitas, status, req.params.id],
          (err) => {
            if (err) return res.status(500).json({ message: 'Server error' })
            res.json({ message: 'Kamar berhasil diupdate' })
          }
        )
      }
    )
  } else {
    // Status bukan kosong, langsung update
    db.query(
      'UPDATE kamar SET nomor=?, tipe=?, harga=?, fasilitas=?, status=? WHERE id=?',
      [nomor, tipe, harga, fasilitas, status, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Server error' })
        res.json({ message: 'Kamar berhasil diupdate' })
      }
    )
  }
})

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM kamar WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    res.json({ message: 'Kamar berhasil dihapus' })
  })
})

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM kamar WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});

module.exports = router