const bcrypt = require('bcryptjs')
const AppError = require('../utils/AppError')
const withTransaction = require('../utils/transaction')

async function confirmPayment(pemesananId, metodeBayar) {
  return withTransaction(async (conn) => {
    const [pemesanan] = await conn.query(
      "SELECT * FROM pemesanan WHERE id = ? FOR UPDATE",
      [pemesananId]
    )
    if (pemesanan.length === 0) throw new AppError("Data tidak ditemukan", 404)
    const data = pemesanan[0]

    const [kamar] = await conn.query(
      "SELECT * FROM kamar WHERE id = ? FOR UPDATE",
      [data.id_kamar]
    )
    if (kamar.length === 0) throw new AppError("Kamar tidak ditemukan", 404)
    if (kamar[0].status === "terisi") {
      throw new AppError(`Kamar ${kamar[0].nomor} sudah terisi!`, 400)
    }

    let newAccountInfo = null
    let userId = data.id_user

    if (!data.id_user) {
      const defaultPassword = data.no_hp
      const hashedPassword = bcrypt.hashSync(defaultPassword, 10)
      const email = `user_${data.no_hp}@kostasync.com`

      const [existingUsers] = await conn.query(
        "SELECT id, nama FROM users WHERE no_hp = ?",
        [data.no_hp]
      )

      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0]
        if (existingUser.nama !== data.nama) {
          await conn.query("UPDATE users SET nama = ? WHERE id = ?", [data.nama, existingUser.id])
        }
        userId = existingUser.id
        newAccountInfo = { email: `user_${data.no_hp}@kostasync.com`, no_hp: data.no_hp, nama: data.nama }
      } else {
        const [userResult] = await conn.query(
          "INSERT INTO users (nama, email, password, no_hp) VALUES (?, ?, ?, ?)",
          [data.nama, email, hashedPassword, data.no_hp]
        )
        userId = userResult.insertId
        newAccountInfo = { email, no_hp: data.no_hp, nama: data.nama }
      }
    }

    const [penyewaResult] = await conn.query(
      `INSERT INTO penyewa (nama, no_hp, id_kamar, tanggal_masuk, status, id_user) VALUES (?, ?, ?, ?, 'aktif', ?)`,
      [data.nama, data.no_hp, data.id_kamar, data.tanggal_masuk, userId]
    )
    const newPenyewaId = penyewaResult.insertId

    await conn.query("UPDATE kamar SET status = 'terisi' WHERE id = ?", [data.id_kamar])

    const today = new Date().toISOString().split('T')[0]
    const bulanFormatted = new Date(data.tanggal_masuk).toISOString().substring(0, 7) + "-01"

    await conn.query(
      `INSERT INTO pembayaran (id_penyewa, kategori, metode_bayar, bulan, jumlah, tanggal_bayar, status)
       VALUES (?, 'Sewa Kamar', ?, ?, ?, ?, 'lunas')`,
      [newPenyewaId, metodeBayar || 'Tunai/Cash', bulanFormatted, kamar[0].harga, today]
    )

    // Auto-generate tagihan bulan depan
    const nextMonth = new Date(bulanFormatted)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const nextBulan = nextMonth.toISOString().substring(0, 7) + "-01"

    await conn.query(
      `INSERT INTO pembayaran (id_penyewa, kategori, metode_bayar, bulan, jumlah, tanggal_bayar, status)
       VALUES (?, 'Sewa Kamar', ?, ?, ?, NULL, 'belum_lunas')`,
      [newPenyewaId, metodeBayar || 'Tunai/Cash', nextBulan, kamar[0].harga]
    )

    await conn.query("UPDATE pemesanan SET status = 'disetujui' WHERE id = ?", [pemesananId])

    const result = { pesan: "Pembayaran dikonfirmasi! Penyewa aktif & transaksi tercatat." }
    if (newAccountInfo) {
      result.new_account = newAccountInfo
    }
    return result
  })
}

module.exports = { confirmPayment }
