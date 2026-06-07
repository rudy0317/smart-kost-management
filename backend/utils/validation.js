const { body, validationResult } = require('express-validator')
const AppError = require('./AppError')

const phoneRegex = /^08[0-9]{8,11}$/

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400)
  }
  next()
}

const no_hp = body('no_hp')
  .matches(phoneRegex)
  .withMessage('Format No. HP tidak valid. Harus diawali 08 dan 10–13 digit (cth: 08123456789)')

const nama = body('nama')
  .notEmpty()
  .withMessage('Nama wajib diisi')

const kamar = [
  body('tipe').notEmpty().withMessage('Tipe kamar wajib diisi'),
  body('harga').isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  body('versi').optional({ values: 'falsy' }),
  body('batas_kamar').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Batas kamar minimal 1'),
]

const penyewa = [
  nama,
  no_hp,
  body('id_kamar').isInt().withMessage('ID kamar tidak valid'),
  body('tanggal_masuk').notEmpty().withMessage('Tanggal masuk wajib diisi'),
]

const pemesanan = [
  nama,
  no_hp,
  body('id_kamar').isInt().withMessage('ID kamar tidak valid'),
  body('tanggal_masuk').notEmpty().withMessage('Tanggal masuk wajib diisi'),
]

const registerUser = [
  nama,
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
  no_hp.optional({ values: 'falsy' }),
]

const pembayaran = [
  body('id_penyewa').isInt().withMessage('ID penyewa tidak valid'),
  body('kategori').notEmpty().withMessage('Kategori wajib diisi'),
  body('jumlah').isFloat({ min: 0 }).withMessage('Jumlah harus angka positif'),
  body('bulan').matches(/^\d{4}-\d{2}$/).withMessage('Format bulan harus YYYY-MM'),
]

const pengeluaran = [
  body('kategori').notEmpty().withMessage('Kategori wajib diisi'),
  body('jumlah').isFloat({ min: 0 }).withMessage('Jumlah harus angka positif'),
  body('tanggal').notEmpty().withMessage('Tanggal wajib diisi'),
]

const pindahKamar = [
  body('id_penyewa').isInt().withMessage('ID penyewa tidak valid'),
  body('id_kamar_baru').isInt().withMessage('ID kamar baru tidak valid'),
]

module.exports = {
  validate,
  no_hp,
  nama,
  kamar,
  penyewa,
  pemesanan,
  registerUser,
  pembayaran,
  pengeluaran,
  pindahKamar,
}
