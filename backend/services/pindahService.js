const AppError = require('../utils/AppError')
const withTransaction = require('../utils/transaction')

async function approveMove(pindahId) {
  return withTransaction(async (conn) => {
    const [pindah] = await conn.query(
      'SELECT * FROM pindah_kamar WHERE id = ? FOR UPDATE',
      [pindahId]
    )
    if (pindah.length === 0) throw new AppError('Request tidak ditemukan', 404)
    const pk = pindah[0]

    if (pk.status !== 'pending') throw new AppError('Request ini sudah diproses', 400)

    const idKamarBaru = pk.id_kamar_baru
    const idPenyewa = pk.id_penyewa
    const idKamarLama = pk.id_kamar_lama

    const [kamarBaru] = await conn.query(
      'SELECT status FROM kamar WHERE id = ? FOR UPDATE',
      [idKamarBaru]
    )
    if (kamarBaru.length === 0) throw new AppError('Kamar baru tidak ditemukan', 404)
    if (kamarBaru[0].status === 'terisi') {
      throw new AppError('Kamar baru sudah terisi oleh orang lain!', 400)
    }

    await conn.query("UPDATE penyewa SET id_kamar = ? WHERE id = ?", [idKamarBaru, idPenyewa])
    await conn.query("UPDATE kamar SET status = 'terisi' WHERE id = ?", [idKamarBaru])
    await conn.query("UPDATE kamar SET status = 'kosong' WHERE id = ?", [idKamarLama])
    await conn.query("UPDATE pindah_kamar SET status = 'disetujui' WHERE id = ?", [pindahId])
  })
}

module.exports = { approveMove }
