const express = require('express')
const router = express.Router()
const pool = require('../dbAsync')

router.get('/', async (req, res, next) => {
  try {
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

    const [[kamar], [pendapatan]] = await Promise.all([
      pool.query(queryKamar),
      pool.query(queryPendapatan),
    ])

    const [[jatuhTempo], [aktivitas]] = await Promise.all([
      pool.query(queryJatuhTempo),
      pool.query(queryAktivitas),
    ])

    res.json({
      total_kamar: kamar[0].total || 0,
      terisi: kamar[0].terisi || 0,
      kosong: kamar[0].kosong || 0,
      pendapatan: pendapatan[0].total || 0,
      jatuh_tempo: jatuhTempo,
      aktivitas
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
