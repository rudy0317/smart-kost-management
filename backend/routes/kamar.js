const express = require('express')
const router = express.Router()
const pool = require('../dbAsync')
const AppError = require('../utils/AppError')
const { kamar: kamarValidation, validate } = require('../utils/validation')

const SERI_MAP = { Standard: 'A', Premium: 'B', VIP: 'C' }

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kamar ORDER BY seri, nomor')
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.get('/limits', async (req, res, next) => {
  try {
    const [limits] = await pool.query('SELECT * FROM kamar_limits ORDER BY seri')
    const [counts] = await pool.query(
      'SELECT seri, COUNT(*) as total FROM kamar GROUP BY seri'
    )
    const merged = limits.map(l => {
      const found = counts.find(c => c.seri === l.seri)
      return {
        ...l,
        total: found ? found.total : 0,
        sisa: l.max_kamar - (found ? found.total : 0)
      }
    })
    res.json(merged)
  } catch (err) {
    next(err)
  }
})

router.post('/', kamarValidation, validate, async (req, res, next) => {
  try {
    const { tipe, harga, fasilitas, batas_kamar } = req.body
    const seri = SERI_MAP[tipe] || 'A'

    const [[limitRow]] = await pool.query(
      'SELECT max_kamar FROM kamar_limits WHERE seri = ?', [seri]
    )
    if (limitRow) {
      const [[{ count }]] = await pool.query(
        'SELECT COUNT(*) as count FROM kamar WHERE seri = ?', [seri]
      )
      if (count >= limitRow.max_kamar) {
        throw new AppError(
          `Kamar seri ${seri} sudah penuh (max ${limitRow.max_kamar} kamar). Hapus kamar yang ada atau ubah limit.`,
          400
        )
      }
    }

    const [last] = await pool.query(
      'SELECT nomor FROM kamar WHERE seri = ? ORDER BY id DESC LIMIT 1',
      [seri]
    )
    let nextNum = 1
    if (last.length > 0) {
      const match = last[0].nomor.match(/-(\d+)$/)
      if (match) nextNum = parseInt(match[1]) + 1
    }
    const nomor = `${seri}-${String(nextNum).padStart(2, '0')}`

    await pool.query(
      'INSERT INTO kamar (nomor, seri, tipe, harga, fasilitas, batas_kamar, status, renovasi) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
      [nomor, seri, tipe, harga, fasilitas, batas_kamar || 1, 'kosong']
    )
    res.json({ message: 'Kamar berhasil ditambahkan', nomor, seri })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { nomor, tipe, harga, fasilitas, status, seri, batas_kamar, renovasi } = req.body

    if (status === 'kosong') {
      const [penyewa] = await pool.query(
        'SELECT * FROM penyewa WHERE id_kamar = ? AND status = "aktif"',
        [req.params.id]
      )
      if (penyewa.length > 0) {
        throw new AppError(
          `Kamar masih ditempati oleh ${penyewa[0].nama}. Keluarkan penyewa terlebih dahulu.`,
          400
        )
      }
    }

    if (renovasi) {
      const [penyewa] = await pool.query(
        'SELECT * FROM penyewa WHERE id_kamar = ? AND status = "aktif"',
        [req.params.id]
      )
      if (penyewa.length > 0) {
        throw new AppError(
          `Kamar masih ditempati oleh ${penyewa[0].nama}. Keluarkan penyewa terlebih dahulu sebelum merenovasi.`,
          400
        )
      }
    }

    await pool.query(
      'UPDATE kamar SET nomor=?, seri=?, tipe=?, harga=?, fasilitas=?, status=?, batas_kamar=?, renovasi=? WHERE id=?',
      [nomor, seri, tipe, harga, fasilitas, renovasi ? 'kosong' : status, batas_kamar, renovasi ? 1 : 0, req.params.id]
    )
    res.json({ message: 'Kamar berhasil diupdate' })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM kamar WHERE id = ?', [req.params.id])
    res.json({ message: 'Kamar berhasil dihapus' })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const [result] = await pool.query("SELECT * FROM kamar WHERE id = ?", [id])
    res.json(result[0])
  } catch (err) {
    next(err)
  }
})

module.exports = router
