const express = require('express')
const router = express.Router()
const db = require('../db')

// 1. GET SELURUH DAFTAR PINDAH KAMAR (UNTUK ADMIN)
router.get('/', (req, res) => {
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
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err })
    res.json(results)
  })
})

// 2. SETUJU PINDAH KAMAR
router.post('/:id/setuju', (req, res) => {
  const { id } = req.params

  // Ambil data request pindah
  db.query('SELECT * FROM pindah_kamar WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Request tidak ditemukan' })
    const pk = results[0]

    if (pk.status !== 'pending') return res.status(400).json({ message: 'Request ini sudah diproses' })

    const idKamarLama = pk.id_kamar_lama
    const idKamarBaru = pk.id_kamar_baru
    const idPenyewa = pk.id_penyewa

    // Pastikan kamar baru masih kosong
    db.query('SELECT status FROM kamar WHERE id = ?', [idKamarBaru], (errKamar, resKamar) => {
      if (errKamar || resKamar.length === 0) return res.status(404).json({ message: 'Kamar baru tidak ditemukan' })
      if (resKamar[0].status === 'terisi') return res.status(400).json({ message: 'Kamar baru sudah terisi oleh orang lain!' })

      // Transaction Start: (1) Update penyewa -> (2) Update kamar baru -> (3) Update kamar lama -> (4) Update request
      db.query("UPDATE penyewa SET id_kamar = ? WHERE id = ?", [idKamarBaru, idPenyewa], (errUpdatePenyewa) => {
        if (errUpdatePenyewa) return res.status(500).json({ message: 'Gagal update penyewa' })

        db.query("UPDATE kamar SET status = 'terisi' WHERE id = ?", [idKamarBaru], () => {
          db.query("UPDATE kamar SET status = 'kosong' WHERE id = ?", [idKamarLama], () => {
            db.query("UPDATE pindah_kamar SET status = 'disetujui' WHERE id = ?", [id], () => {
              res.json({ message: 'Permintaan pindah kamar berhasil disetujui!' })
            })
          })
        })
      })
    })
  })
})

// 3. TOLAK PINDAH KAMAR
router.post('/:id/tolak', (req, res) => {
  const { id } = req.params
  db.query("UPDATE pindah_kamar SET status = 'ditolak' WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: 'Gagal tolak request' })
    res.json({ message: 'Request berhasil ditolak' })
  })
})

// 4. GET PENYEWA AKTIF (UNTUK DROPDOWN ADMIN)
router.get('/active-tenants', (req, res) => {
  db.query('SELECT id, nama, no_hp, id_kamar FROM penyewa WHERE status = "aktif"', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    res.json(results)
  })
})

// 5. GET KAMAR KOSONG (UNTUK DROPDOWN ADMIN)
router.get('/available-rooms', (req, res) => {
  db.query('SELECT id, nomor, tipe FROM kamar WHERE status IN ("kosong", "tersedia")', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' })
    res.json(results)
  })
})

// 6. TAMBAH REQUEST PINDAH MANUAL (OLEH ADMIN)
router.post('/', (req, res) => {
  const { id_penyewa, id_kamar_baru, alasan } = req.body

  // Cari data penyewa untuk mendapatkan id_user dan id_kamar_lama
  db.query('SELECT id_user, id_kamar FROM penyewa WHERE id = ?', [id_penyewa], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Penyewa tidak ditemukan' })
    
    const p = results[0]
    const sql = `INSERT INTO pindah_kamar (id_user, id_penyewa, id_kamar_lama, id_kamar_baru, alasan, status) VALUES (?, ?, ?, ?, ?, 'pending')`
    
    db.query(sql, [p.id_user, id_penyewa, p.id_kamar, id_kamar_baru, alasan || ''], (errInsert) => {
      if (errInsert) return res.status(500).json({ message: 'Gagal membuat request pindah manual' })
      res.json({ message: 'Request pindah kamar manual berhasil dibuat!' })
    })
  })
})

module.exports = router

