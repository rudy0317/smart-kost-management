import { useState, useEffect } from 'react'
import axios from 'axios'

function PemesananPublik() {
  const [form, setForm] = useState({
    nama: '', no_hp: '', id_kamar: '', tanggal_masuk: ''
  })
  const [kamar, setKamar] = useState([])
  const [sukses, setSukses] = useState(false)

  const fetchKamar = async () => {
    const res = await axios.get('http://localhost:5000/api/kamar')
    setKamar(res.data.filter(k => k.status === 'kosong'))
  }

  useEffect(() => {
    fetchKamar()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // FUNGSI BARU: Klik card langsung pilih kamar di form
  const handleKamarClick = (id) => {
    setForm({ ...form, id_kamar: id })
    // Scroll otomatis ke form agar user tahu kamarnya sudah terpilih
    const formElement = document.getElementById('order-form')
    formElement?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/pemesanan', form)
      setSukses(true)
      setForm({ nama: '', no_hp: '', id_kamar: '', tanggal_masuk: '' })
      setTimeout(() => setSukses(false), 5000);
    } catch (err) {
      console.error("Gagal memesan", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex justify-center items-center py-12 px-4 font-sans">
      <div className="w-full max-w-2xl bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-100">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Kost Mewah</h1>
          <p className="text-gray-500">Pesan kamar eksklusif Anda secara online dengan mudah dan cepat.</p>
        </div>

        {sukses && (
          <div className="bg-green-50 border-l-4 border-green-600 text-green-800 p-4 rounded-r-lg mb-8 shadow-sm transition-all animate-bounce">
            <p className="font-medium">Pemesanan berhasil dikirim. Admin kami akan segera menghubungi Anda.</p>
          </div>
        )}

        {/* SECTION KAMAR */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-5 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800">Kamar Tersedia</h2>
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md font-bold">Klik kamar untuk memilih</span>
          </div>

          <div className="space-y-4">
            {kamar.length === 0 && (
              <div className="bg-gray-50 p-8 rounded-2xl text-center border border-gray-200">
                <p className="text-gray-500 font-medium">Mohon maaf, belum ada kamar kosong saat ini.</p>
              </div>
            )}

            {kamar.map(k => (
              <div
                key={k.id}
                onClick={() => handleKamarClick(k.id)}
                className={`group flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 rounded-2xl shadow-sm transition-all duration-300 border-2 cursor-pointer
                  ${form.id_kamar === k.id
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                    : 'border-transparent bg-white border-l-gray-800 hover:border-gray-300 hover:shadow-md'}`}
              >
                <div className="mb-3 sm:mb-0">
                  <p className="font-bold text-gray-800 text-lg flex items-center">
                    Kamar {k.nomor}
                    {form.id_kamar === k.id && <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Terpilih</span>}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Fasilitas: {k.fasilitas}</p>
                </div>

                <div className="sm:text-right">
                  <p className={`font-extrabold text-xl transition-colors ${form.id_kamar === k.id ? 'text-indigo-600' : 'text-gray-900'}`}>
                    Rp {Number(k.harga).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">/ bulan</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION FORM */}
        <div id="order-form">
          <h2 className="text-xl font-bold text-gray-800 mb-5 border-b pb-2">Data Pemesanan</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
              <input name="nama" placeholder="Masukkan nama sesuai KTP" value={form.nama} onChange={handleChange} required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-800 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">No. HP / WhatsApp</label>
              <input name="no_hp" placeholder="Contoh: 08123456789" value={form.no_hp} onChange={handleChange} required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-800 outline-none transition-all" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Kamar</label>
                <select name="id_kamar" value={form.id_kamar} onChange={handleChange} required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-800 outline-none transition-all cursor-pointer">
                  <option value="">-- Silakan Pilih --</option>
                  {kamar.map(k => (
                    <option key={k.id} value={k.id}>Kamar {k.nomor} (Rp {Number(k.harga).toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Masuk</label>
                <input name="tanggal_masuk" type="date" value={form.tanggal_masuk} onChange={handleChange} required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-800 outline-none transition-all" />
              </div>
            </div>

            <button type="submit"
              className="w-full mt-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95">
              Kirim Pemesanan
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default PemesananPublik