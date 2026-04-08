const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/list-tahun', (req, res) => {
  const query = `SELECT DISTINCT YEAR(bulan) as tahun FROM pembayaran ORDER BY tahun DESC`
  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err)

    const tahunDariDB = results.map(r => r.tahun.toString())
    const tahunSekarang = new Date().getFullYear()

    // Tambahin tahun sekarang, tahun lalu, dan 2 tahun ke depan
    const tahunTambahan = [
      (tahunSekarang - 1).toString(),
      tahunSekarang.toString(),
      (tahunSekarang + 1).toString(),
      (tahunSekarang + 2).toString(),
    ]

    // Gabungin & hapus duplikat, urutkan descending
    const allTahun = [...new Set([...tahunTambahan, ...tahunDariDB])]
      .sort((a, b) => b - a)

    res.json(allTahun)
  })
})

router.get('/', (req, res) => {
  const { bulan } = req.query

  if (!bulan) {
    return res.status(400).json({ message: 'Parameter bulan diperlukan (format: YYYY-MM)' })
  }

  const [year, month] = bulan.split('-')

  const queryPemasukan = `
    SELECT
      SUM(jumlah) as total_pemasukan,
      COUNT(CASE WHEN status = 'lunas' THEN 1 END) as sudah_bayar,
      COUNT(CASE WHEN status != 'lunas' THEN 1 END) as belum_bayar
    FROM pembayaran
    WHERE MONTH(bulan) = ? AND YEAR(bulan) = ?
  `
  const queryPengeluaran = `
    SELECT SUM(jumlah) as total_pengeluaran
    FROM pengeluaran
    WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?
  `
  const queryDetail = `
    SELECT pb.*, py.nama as nama_penyewa, k.nomor as nomor_kamar
    FROM pembayaran pb
    LEFT JOIN penyewa py ON pb.id_penyewa = py.id
    LEFT JOIN kamar k ON py.id_kamar = k.id
    WHERE MONTH(pb.bulan) = ? AND YEAR(pb.bulan) = ?
    ORDER BY pb.created_at DESC
  `
  const queryPerMetode = `
    SELECT metode_bayar, SUM(jumlah) as total
    FROM pembayaran
    WHERE MONTH(bulan) = ? AND YEAR(bulan) = ? AND status = 'lunas'
    GROUP BY metode_bayar
  `

  db.query(queryPemasukan, [month, year], (err, pemasukan) => {
    if (err) return res.status(500).json({ message: 'Error Pemasukan', error: err })
    db.query(queryPengeluaran, [month, year], (err, pengeluaran) => {
      if (err) return res.status(500).json({ message: 'Error Pengeluaran', error: err })
      db.query(queryDetail, [month, year], (err, detail) => {
        if (err) return res.status(500).json({ message: 'Error Detail', error: err })
        db.query(queryPerMetode, [month, year], (err, metode) => {
          if (err) return res.status(500).json({ message: 'Error Metode', error: err })
          res.json({
            total_pemasukan: pemasukan[0].total_pemasukan || 0,
            sudah_bayar: pemasukan[0].sudah_bayar || 0,
            belum_bayar: pemasukan[0].belum_bayar || 0,
            total_pengeluaran: pengeluaran[0].total_pengeluaran || 0,
            detail,
            ringkasan_metode: metode
          })
        })
      })
    })
  })
})

module.exports = router