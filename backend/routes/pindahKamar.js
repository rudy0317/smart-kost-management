const express = require('express')
const router = express.Router()
const pool = require('../dbAsync')
const AppError = require('../utils/AppError')
const pindahService = require('../services/pindahService')
const { pindahKamar: pindahValidation, validate } = require('../utils/validation')

// 1. GET SELURUH DAFTAR PINDAH KAMAR (UNTUK ADMIN)
router.get('/', async (req, res, next) => {
  try {
    const sql = `
      SELECT pk.*, 
             u.nama, 
             u.no_hp,
             kl.nomor as nomor_kamar_lama, 
             kl.tipe as tipe_kamar_lama,
             kb.nomor as nomor_kamar_baru, 
             kb.tipe as tipe_kamar_baru
      FROM pindah_kamar pk
      JOIN users u ON pk.id_user = u.id
      JOIN kamar kl ON pk.id_kamar_lama = kl.id
      JOIN kamar kb ON pk.id_kamar_baru = kb.id
      ORDER BY pk.id DESC
    `
    const [rows] = await pool.query(sql)
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// 2. SETUJU PINDAH KAMAR
router.post('/:id/setuju', async (req, res, next) => {
  try {
    await pindahService.approveMove(req.params.id)
    res.json({ message: 'Permintaan pindah kamar berhasil disetujui!' })
  } catch (err) {
    next(err)
  }
})

// 3. TOLAK PINDAH KAMAR
router.post('/:id/tolak', async (req, res, next) => {
  try {
    const { id } = req.params
    await pool.query("UPDATE pindah_kamar SET status = 'ditolak' WHERE id = ?", [id])
    res.json({ message: 'Request berhasil ditolak' })
  } catch (err) {
    next(err)
  }
})

// 4. GET PENYEWA AKTIF (UNTUK DROPDOWN ADMIN)
router.get('/active-tenants', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama, no_hp, id_kamar FROM penyewa WHERE status = "aktif"'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// 5. GET KAMAR KOSONG (UNTUK DROPDOWN ADMIN)
router.get('/available-rooms', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nomor, tipe FROM kamar WHERE status IN ("kosong", "tersedia") ORDER BY nomor ASC'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// 6. TAMBAH REQUEST PINDAH MANUAL (OLEH ADMIN)
router.post('/', pindahValidation, validate, async (req, res, next) => {
  try {
    const { id_penyewa, id_kamar_baru, alasan } = req.body

    // Cari data penyewa untuk mendapatkan id_user dan id_kamar_lama
    const [penyewa] = await pool.query(
      'SELECT id_user, id_kamar FROM penyewa WHERE id = ?',
      [id_penyewa]
    )
    if (penyewa.length === 0) throw new AppError('Penyewa tidak ditemukan', 404)

    const p = penyewa[0]
    const sql = `INSERT INTO pindah_kamar (id_user, id_penyewa, id_kamar_lama, id_kamar_baru, alasan, status) VALUES (?, ?, ?, ?, ?, 'pending')`
    await pool.query(sql, [p.id_user, id_penyewa, p.id_kamar, id_kamar_baru, alasan || ''])
    res.json({ message: 'Request pindah kamar manual berhasil dibuat!' })
  } catch (err) {
    next(err)
  }
})

// 7. HAPUS REQUEST PINDAH (OLEH ADMIN)
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM pindah_kamar WHERE id = ?', [req.params.id])
    res.json({ message: 'Request pindah kamar berhasil dihapus' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
