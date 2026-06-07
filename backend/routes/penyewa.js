const express = require('express')
const router = express.Router()
const pool = require('../dbAsync')
const AppError = require('../utils/AppError')
const withTransaction = require('../utils/transaction')
const { penyewa: penyewaValidation, validate } = require('../utils/validation')

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, k.nomor as nomor_kamar FROM penyewa p LEFT JOIN kamar k ON p.id_kamar = k.id'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.post('/', penyewaValidation, validate, async (req, res, next) => {
  try {
    const { nama, no_hp, id_kamar, tanggal_masuk } = req.body
    const [result] = await pool.query(
      'INSERT INTO penyewa (nama, no_hp, id_kamar, tanggal_masuk) VALUES (?, ?, ?, ?)',
      [nama, no_hp, id_kamar, tanggal_masuk]
    )
    await pool.query('UPDATE kamar SET status = "terisi" WHERE id = ?', [id_kamar])
    res.json({ message: 'Penyewa berhasil ditambahkan' })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { nama, no_hp, id_kamar, tanggal_masuk } = req.body
    await pool.query(
      'UPDATE penyewa SET nama=?, no_hp=?, id_kamar=?, tanggal_masuk=? WHERE id=?',
      [nama, no_hp, id_kamar, tanggal_masuk, req.params.id]
    )
    res.json({ message: 'Penyewa berhasil diupdate' })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await withTransaction(async (conn) => {
      const [penyewa] = await conn.query('SELECT id_kamar FROM penyewa WHERE id = ?', [req.params.id])
      if (penyewa.length === 0) throw new AppError('Penyewa tidak ditemukan', 404)
      const id_kamar = penyewa[0].id_kamar

      await conn.query('DELETE FROM penyewa WHERE id = ?', [req.params.id])
      await conn.query('UPDATE kamar SET status = "kosong" WHERE id = ?', [id_kamar])
    })
    res.json({ message: 'Penyewa berhasil dihapus' })
  } catch (err) {
    next(err)
  }
})

// ─── AMBIL INFO AKUN USER ─────────────────────────────────────────────────────
router.get('/:id/akun', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.email, u.no_hp 
      FROM users u 
      JOIN penyewa p ON p.id_user = u.id 
      WHERE p.id = ?`, 
      [req.params.id]
    )
    if (rows.length === 0) throw new AppError('Akun tidak ditemukan', 404)
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

// ─── HAPUS AKUN USER (TANPA MENGHAPUS PENYEWA ATAU SEBALIKNYA) ────────────────
router.delete('/:id/akun', async (req, res, next) => {
  try {
    await withTransaction(async (conn) => {
      const [penyewa] = await conn.query('SELECT id_user FROM penyewa WHERE id = ?', [req.params.id])
      if (penyewa.length === 0 || !penyewa[0].id_user) {
        throw new AppError('Penyewa tidak memiliki akun terhubung', 404)
      }

      const id_user = penyewa[0].id_user
      await conn.query('DELETE FROM users WHERE id = ?', [id_user])
      await conn.query('UPDATE penyewa SET id_user = NULL WHERE id = ?', [req.params.id])
    })
    res.json({ message: 'Akun login penyewa berhasil dihapus' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
