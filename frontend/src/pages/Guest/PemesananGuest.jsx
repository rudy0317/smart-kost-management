import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api'

function PemesananPublik() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nama: '', no_hp: '', id_kamar: '', tanggal_masuk: '',
    metode_bayar: 'Tunai/Cash', kode_unik: 0
  })
  const [kamar, setKamar] = useState([])
  const [sukses, setSukses] = useState(false)
  const [isKamarOpen, setIsKamarOpen] = useState(false)

  // State untuk fitur cek status
  const [noHpCek, setNoHpCek] = useState('')
  const [isCekLoading, setIsCekLoading] = useState(false)
  const [cekError, setCekError] = useState('')
  const [showCredModal, setShowCredModal] = useState(false)
  const [credInfo, setCredInfo] = useState(null)

  const fetchKamar = async () => {
    const res = await api.get('http://localhost:5000/api/kamar')
    setKamar(res.data.filter(k => k.status === 'kosong'))
  }

  useEffect(() => {
    fetchKamar()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleKamarClick = (id) => {
    // Generate kode unik random 100-999
    const randomCode = Math.floor(Math.random() * 899) + 100
    setForm({ ...form, id_kamar: id, kode_unik: randomCode })
    const formElement = document.getElementById('order-form')
    formElement?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('http://localhost:5000/api/pemesanan', form)
      setSukses(true)
      setForm({
        nama: '', no_hp: '', id_kamar: '', tanggal_masuk: '',
        metode_bayar: 'Tunai/Cash', kode_unik: 0
      })
      setTimeout(() => setSukses(false), 8000)
    } catch (err) {
      console.error("Gagal memesan", err)
    }
  }

  // ─── CEK STATUS PEMESANAN ─────────────────────────────────────────────────
  const handleCekStatus = async (e) => {
    e.preventDefault()
    setCekError('')
    setIsCekLoading(true)
    try {
      const res = await api.get('http://localhost:5000/api/pemesanan')
      const semuaPemesanan = res.data

      const myBooking = semuaPemesanan.find(p => p.no_hp === noHpCek.trim())

      if (!myBooking) {
        setCekError('Tidak ada pemesanan dengan nomor HP tersebut.')
        setIsCekLoading(false)
        return
      }

      if (myBooking.status === 'disetujui') {
        // Pembayaran sudah dikonfirmasi admin -> tampilkan credentials
        const email = `user_${myBooking.no_hp}@kostasync.com`
        setCredInfo({
          nama: myBooking.nama,
          email,
          no_hp: myBooking.no_hp,
          nomor_kamar: myBooking.nomor_kamar,
        })
        setShowCredModal(true)
      } else if (myBooking.status === 'menunggu_pembayaran') {
        setCekError('Pemesanan kamu sudah disetujui oleh admin. Silahkan lakukan pembayaran, lalu tunggu konfirmasi.')
      } else if (myBooking.status === 'ditolak') {
        setCekError('Maaf, pemesanan kamu ditolak oleh admin. Silahkan hubungi kami untuk informasi lebih lanjut.')
      } else {
        setCekError('Pemesanan kamu masih dalam review oleh admin. Mohon tunggu beberapa saat.')
      }
    } catch (err) {
      setCekError('Gagal memeriksa status. Silahkan coba lagi.')
    } finally {
      setIsCekLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex justify-center items-start py-12 px-4 font-sans">
      <div className="w-full max-w-2xl space-y-6">

        {/* ─── CREDENTIALS MODAL ──────────────────────────────────────────── */}
        {showCredModal && credInfo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.55)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowCredModal(false) }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header Gradient */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white text-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-extrabold">Pembayaran Diterima! 🎉</h2>
                <p className="text-indigo-200 text-sm mt-1">Selamat datang, <span className="font-bold text-white">{credInfo.nama}</span>!</p>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-500 text-sm text-center mb-5">
                  Akun kamu sudah aktif. Login menggunakan kredensial berikut:
                </p>

                <div className="space-y-3 mb-5">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email / Username</p>
                    <p className="font-mono font-bold text-indigo-600 text-sm break-all">{credInfo.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      atau gunakan No. HP:{' '}
                      <span className="font-mono font-semibold text-slate-600">{credInfo.no_hp}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Password</p>
                    <p className="font-mono font-bold text-indigo-600 text-sm">{credInfo.no_hp}</p>
                    <p className="text-xs text-slate-400 mt-1">Password awal = Nomor HP kamu</p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-emerald-700">
                      Kamu sudah terdaftar di <strong>Kamar {credInfo.nomor_kamar}</strong>.
                      Setelah login, kamu bisa cek status kamar &amp; riwayat pembayaran di dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCredModal(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-2xl text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    Nanti
                  </button>
                  <button
                    onClick={() => navigate('/login-user')}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-200"
                  >
                    Login Sekarang →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── CARD UTAMA ─────────────────────────────────────────────────── */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-100">

          {/* HEADER */}
          <div className="text-center mb-10">
            {/* Nav kecil di atas */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/katalog"
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Katalog
              </Link>
              <Link
                to="/login-user"
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Sudah punya akun?
                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-indigo-700 transition-colors">
                  Login
                </span>
              </Link>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Kost Mewah</h1>
            <p className="text-gray-500">Pesan kamar eksklusif Anda secara online dengan mudah dan cepat.</p>
          </div>

          {sukses && (
            <div className="bg-green-50 border-l-4 border-green-600 text-green-800 p-4 rounded-r-lg mb-8 shadow-sm">
              <p className="font-bold mb-1">✅ Pemesanan berhasil dikirim!</p>
              <p className="text-sm text-green-700">
                Admin akan segera memproses pemesanan kamu. Gunakan fitur <strong>"Cek Status"</strong> di bawah dengan No. HP yang kamu daftarkan untuk mendapatkan info login setelah pembayaran dikonfirmasi.
              </p>
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
                <motion.div
                  key={k.id}
                  layout
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleKamarClick(k.id)}
                  className={`group flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 rounded-2xl shadow-sm transition-all duration-300 border-2 cursor-pointer
                    ${form.id_kamar === k.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                      : 'border-transparent bg-white hover:border-gray-300 hover:shadow-md'}`}
                >
                  <div className="mb-3 sm:mb-0">
                    <p className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      Kamar {k.nomor}
                      <AnimatePresence>
                        {form.id_kamar === k.id && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold"
                          >
                            Terpilih
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Fasilitas: {k.fasilitas}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className={`font-extrabold text-xl transition-colors ${form.id_kamar === k.id ? 'text-indigo-600' : 'text-gray-900'}`}>
                      Rp {Number(k.harga).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">/ bulan</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SECTION FORM */}
          <div id="order-form">
            <h2 className="text-xl font-bold text-gray-800 mb-5 border-b pb-2">Data Pemesanan</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  name="nama" placeholder="Masukkan nama sesuai KTP"
                  value={form.nama} onChange={handleChange} required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">No. HP / WhatsApp</label>
                <input
                  name="no_hp" placeholder="Contoh: 08123456789"
                  value={form.no_hp} onChange={handleChange} required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Kamar</label>
                  <div
                    onClick={() => setIsKamarOpen(!isKamarOpen)}
                    className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm
                      ${isKamarOpen ? 'bg-white ring-2 ring-indigo-500 border-transparent' : 'hover:border-gray-300'}`}
                  >
                    <span className={`text-sm ${form.id_kamar ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                      {form.id_kamar
                        ? `Kamar ${kamar.find(k => k.id === form.id_kamar)?.nomor}`
                        : '-- Pilih Kamar --'}
                    </span>
                    <motion.svg
                      animate={{ rotate: isKamarOpen ? 180 : 0 }}
                      className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>

                  <AnimatePresence>
                    {isKamarOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsKamarOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden py-2 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {kamar.length > 0 ? kamar.map(k => (
                            <div
                              key={k.id}
                              onClick={() => {
                                handleKamarClick(k.id);
                                setIsKamarOpen(false);
                              }}
                              className={`px-5 py-3 text-sm cursor-pointer transition-colors flex justify-between items-center
                                ${form.id_kamar === k.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                              <span>Kamar {k.nomor}</span>
                              <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">
                                Rp {Number(k.harga).toLocaleString('id-ID')}
                              </span>
                            </div>
                          )) : (
                            <div className="px-5 py-3 text-sm text-gray-400 italic text-center">Tidak ada kamar tersedia</div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                  <input type="hidden" name="id_kamar" value={form.id_kamar} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Masuk</label>
                  <input
                    name="tanggal_masuk" type="date"
                    value={form.tanggal_masuk} onChange={handleChange} required
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* ─── METODE PEMBAYARAN ─── */}
              <div className="bg-white border-t border-slate-100 mt-6 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Metode Pembayaran
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {['Tunai/Cash', 'Transfer Bank', 'QRIS'].map((m) => (
                    <div
                      key={m}
                      onClick={() => setForm({ ...form, metode_bayar: m })}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2
                        ${form.metode_bayar === m
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-indigo-100 shadow-lg'
                          : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                    >
                      <div className={`p-2 rounded-xl ${form.metode_bayar === m ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}>
                        {m === 'QRIS' && <svg className="w-5 h-5 font-bold" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h4v4H3V3zm0 14h4v4H3v-4zM17 3h4v4h-4V3zM14 14h3v3h-3v-3zm3-3h4v3h-4v-3zm0 6h4v4h-4v-4zM14 17h3v4h-3v-4zM11 11h3v3h-3v-3zm0 3h3v3h-3v-3zm3-3h3v3h-3v-3zM3 11h4v4h-4v-4zM17 11h4v4h-4v-4z"/></svg>}
                        {m === 'Transfer Bank' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                        {m === 'Tunai/Cash' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      </div>
                      <span className={`text-xs font-bold ${form.metode_bayar === m ? 'text-indigo-600' : 'text-gray-500'}`}>{m}</span>
                    </div>
                  ))}
                </div>

                {/* Info dinamis berdasarkan pilihan */}
                {form.id_kamar && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-500 font-medium tracking-tight">Total Pembayaran</span>
                      <div className="text-right">
                        <span className="block text-lg font-black text-slate-800">
                          Rp {(Number(kamar.find(k => k.id === form.id_kamar)?.harga || 0) + (form.metode_bayar !== 'Tunai/Cash' ? form.kode_unik : 0)).toLocaleString('id-ID')}
                        </span>
                        {form.metode_bayar !== 'Tunai/Cash' && (
                          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Sudah termasuk kode unik Rp {form.kode_unik}</span>
                        )}
                      </div>
                    </div>

                    {form.metode_bayar === 'QRIS' && (
                      <div className="mt-4 flex flex-col items-center">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-3">
                          <img src="/images/qris.png" alt="QRIS" className="w-48 h-auto" />
                        </div>
                        <p className="text-[10px] text-center text-gray-400 font-medium">
                          Silakan scan QRIS di atas dan pastikan nominal sesuai<br />sampai 3 digit terakhir untuk verifikasi otomatis.
                        </p>
                      </div>
                    )}

                    {form.metode_bayar === 'Transfer Bank' && (
                      <div className="mt-4 p-4 bg-indigo-600 rounded-2xl text-white">
                        <p className="text-xs opacity-80 mb-1">Nomor Rekening BCA</p>
                        <p className="text-xl font-black tracking-widest mb-3">123-456-7890</p>
                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">A/N Kost Mewah Indonesia</p>
                      </div>
                    )}

                    {form.metode_bayar === 'Tunai/Cash' && (
                      <p className="text-xs text-gray-500 italic mt-2">
                        * Silakan bayar tunai di lokasi saat check-in setelah disetujui admin.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                Kirim Pemesanan
              </button>
            </form>
          </div>
        </div>

        {/* ─── CARD CEK STATUS ────────────────────────────────────────────── */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Cek Status Pemesanan</h2>
              <p className="text-xs text-gray-400">Masukkan No. HP yang kamu daftarkan untuk melihat status &amp; info login</p>
            </div>
          </div>

          <form onSubmit={handleCekStatus} className="flex gap-3">
            <input
              type="tel"
              placeholder="No. HP (cth: 08123456789)"
              value={noHpCek}
              onChange={e => { setNoHpCek(e.target.value); setCekError('') }}
              required
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition-all text-sm"
            />
            <button
              type="submit"
              disabled={isCekLoading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all text-sm whitespace-nowrap disabled:opacity-60"
            >
              {isCekLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Cek...
                </span>
              ) : 'Cek Status'}
            </button>
          </form>

          {cekError && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-amber-700 font-medium">{cekError}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default PemesananPublik