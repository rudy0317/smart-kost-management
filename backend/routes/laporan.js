const express = require('express')
const router = express.Router()
const pool = require('../dbAsync')
const AppError = require('../utils/AppError')

router.get('/list-tahun', async (req, res, next) => {
  try {
    const query = `SELECT DISTINCT YEAR(bulan) as tahun FROM pembayaran ORDER BY tahun DESC`
    const [rows] = await pool.query(query)

    const tahunDariDB = rows.map(r => r.tahun.toString())
    const tahunSekarang = new Date().getFullYear()

    const tahunTambahan = [
      (tahunSekarang - 1).toString(),
      tahunSekarang.toString(),
      (tahunSekarang + 1).toString(),
      (tahunSekarang + 2).toString(),
    ]

    const allTahun = [...new Set([...tahunTambahan, ...tahunDariDB])]
      .sort((a, b) => b - a)

    res.json(allTahun)
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const { bulan } = req.query

    if (!bulan) {
      throw new AppError('Parameter bulan diperlukan (format: YYYY-MM)', 400)
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

    const [[pemasukan], [pengeluaran], [detail], [metode]] = await Promise.all([
      pool.query(queryPemasukan, [month, year]),
      pool.query(queryPengeluaran, [month, year]),
      pool.query(queryDetail, [month, year]),
      pool.query(queryPerMetode, [month, year]),
    ])

    res.json({
      total_pemasukan: pemasukan[0].total_pemasukan || 0,
      sudah_bayar: pemasukan[0].sudah_bayar || 0,
      belum_bayar: pemasukan[0].belum_bayar || 0,
      total_pengeluaran: pengeluaran[0].total_pengeluaran || 0,
      detail,
      ringkasan_metode: metode
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
