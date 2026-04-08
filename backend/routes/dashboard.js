const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res) => {
  const queryKamar = 'SELECT COUNT(*) as total, SUM(status = "terisi") as terisi, SUM(status = "kosong") as kosong FROM kamar'
  const queryPendapatan = 'SELECT SUM(jumlah) as total FROM pembayaran WHERE status = "lunas"'
  const queryJatuhTempo = `
    SELECT pb.*, py.nama as nama_penyewa, k.nomor as nomor_kamar
    FROM pembayaran pb
    LEFT JOIN penyewa py ON pb.id_penyewa = py.id
    LEFT JOIN kamar k ON py.id_kamar = k.id
    WHERE pb.status != 'lunas'
    ORDER BY pb.created_at DESC
    LIMIT 5
  `
  const queryAktivitas = `
    SELECT 'Pemesanan baru' as jenis, nama as keterangan, created_at FROM pemesanan
    UNION ALL
    SELECT 'Penyewa baru' as jenis, nama as keterangan, created_at FROM penyewa
    ORDER BY created_at DESC
    LIMIT 5
  `

  db.query(queryKamar, (err, kamar) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    db.query(queryPendapatan, (err, pendapatan) => {
      if (err) return res.status(500).json({ message: 'Server error' })
      db.query(queryJatuhTempo, (err, jatuhTempo) => {
        if (err) return res.status(500).json({ message: 'Server error' })
        db.query(queryAktivitas, (err, aktivitas) => {
          if (err) return res.status(500).json({ message: 'Server error' })
          res.json({
            total_kamar: kamar[0].total || 0,
            terisi: kamar[0].terisi || 0,
            kosong: kamar[0].kosong || 0,
            pendapatan: pendapatan[0].total || 0,
            jatuh_tempo: jatuhTempo,
            aktivitas
          })
        })
      })
    })
  })
})

module.exports = router