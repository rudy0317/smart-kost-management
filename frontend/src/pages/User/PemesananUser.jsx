import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { fadeInUp, hoverClick, staggerContainer } from '../../utils/animations'
import { btnPrimary, inputStyle, labelStyle } from '../../utils/theme'
import { inputUser, labelUser, btnUserPrimary, textUserAccent, cardUser } from '../../utils/themeUser'
import { getKamarImage } from '../../utils/imageHelper'
import kamarDefaultImg from '../../assets/kamar_default.png'

function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])) } catch { return null }
}

function PemesananUser() {
  const navigate = useNavigate()
  const location = useLocation()
  const preselectedKamar = location.state?.id_kamar || ''

  const [userData, setUserData] = useState(null)
  const [kamar, setKamar] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sukses, setSukses] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nama: '', no_hp: '', id_kamar: preselectedKamar, tanggal_masuk: '',
  })

  // ─── State Cek Status ───────────────────────────────────────────────
  const [noHpCek, setNoHpCek] = useState('')
  const [isCekLoading, setIsCekLoading] = useState(false)
  const [cekError, setCekError] = useState('')
  const [cekStatusMsg, setCekStatusMsg] = useState('')
  const [showCredModal, setShowCredModal] = useState(false)
  const [credInfo, setCredInfo] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('user_token')
    if (token && token !== "null" && token !== "undefined") {
      const decoded = decodeToken(token)
      if (decoded) {
        setUserData(decoded)
        setForm(prev => ({ ...prev, nama: decoded.nama || '', no_hp: decoded.no_hp || '' }))
      }
    }
    axios.get('http://localhost:5000/api/kamar')
      .then(res => { setKamar(res.data.filter(k => k.status === 'kosong')); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // ─── State validasi inline ─────────────────────────────────────────
  const [noHpError, setNoHpError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'no_hp') setNoHpError('') // clear error saat user mengetik
  }

  const handleKamarClick = (id) => {
    setForm({ ...form, id_kamar: id })
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validasi No. HP: harus diawali 08 dan 10-13 digit
    const phoneRegex = /^08[0-9]{8,11}$/
    if (!phoneRegex.test(form.no_hp)) {
      setNoHpError('Nomor HP tidak valid. Harus diawali 08 dan 10–13 digit (cth: 08123456789)')
      document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('user_token')
      const headers = token && token !== "null" ? { Authorization: `Bearer ${token}` } : {}
      await axios.post('http://localhost:5000/api/pemesanan', form, { headers })
      setSukses(true)
      setForm(prev => ({ ...prev, id_kamar: '', tanggal_masuk: '' }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => setSukses(false), 8000)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pemesanan.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Cek Status Pemesanan ──────────────────────────────────────────
  const handleCekStatus = async (e) => {
    e.preventDefault()
    setCekError(''); setCekStatusMsg('')
    setIsCekLoading(true)
    try {
      const res = await axios.get('http://localhost:5000/api/pemesanan')
      const myBooking = res.data.find(p => p.no_hp === noHpCek.trim())

      if (!myBooking) {
        setCekError('Tidak ada pemesanan dengan nomor HP tersebut.')
        setIsCekLoading(false)
        return
      }

      if (myBooking.status === 'disetujui') {
        setCredInfo({
          nama: myBooking.nama,
          email: `user_${myBooking.no_hp}@kostasync.com`,
          no_hp: myBooking.no_hp,
          nomor_kamar: myBooking.nomor_kamar,
        })
        setShowCredModal(true)
      } else if (myBooking.status === 'menunggu_pembayaran') {
        setCekStatusMsg('Pemesanan kamu sudah disetujui admin. Silahkan lakukan pembayaran, lalu tunggu konfirmasi.')
      } else if (myBooking.status === 'ditolak') {
        setCekError('Maaf, pemesanan kamu ditolak oleh admin. Silahkan hubungi kami untuk info lebih lanjut.')
      } else {
        setCekStatusMsg('Pemesanan kamu masih dalam review oleh admin. Mohon tunggu.')
      }
    } catch (err) {
      setCekError('Gagal memeriksa status. Silahkan coba lagi.')
    } finally {
      setIsCekLoading(false)
    }
  }

  const darkInput = inputUser
  const darkLabel = labelUser + ' mb-1.5 block'

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Memuat data...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">

      {/* ─── CREDENTIALS MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showCredModal && credInfo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.65)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowCredModal(false) }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 p-6 text-white text-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">Pembayaran Dikonfirmasi</h2>
                <p className="text-white/70 text-sm mt-1">Selamat datang, <span className="font-bold text-white">{credInfo.nama}</span></p>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-slate-400 text-sm text-center mb-5">
                  Akun kamu sudah aktif. Login menggunakan kredensial berikut:
                </p>
                <div className="space-y-3 mb-5">
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email / Username</p>
                    <p className="font-mono font-bold text-cyan-400 text-sm break-all">{credInfo.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      atau No. HP: <span className="font-mono font-semibold text-slate-300">{credInfo.no_hp}</span>
                    </p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Password</p>
                    <p className="font-mono font-bold text-cyan-400 text-sm">{credInfo.no_hp}</p>
                    <p className="text-xs text-slate-500 mt-1">Password awal = Nomor HP kamu</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-emerald-400">
                      Kamu sudah terdaftar di <strong>Kamar {credInfo.nomor_kamar}</strong>.
                      Setelah login, cek dashboard untuk riwayat pembayaran.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCredModal(false)}
                    className="flex-1 py-3 border border-slate-700 rounded-2xl text-slate-400 font-semibold text-sm hover:bg-slate-800 transition-all"
                  >
                    Nanti
                  </button>
                  <button
                    onClick={() => navigate('/login-user')}
                    className={`flex-1 py-3 ${btnUserPrimary} rounded-2xl font-bold text-sm`}
                  >
                    Login Sekarang →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/katalog" className={`text-xl ${textUserAccent}`}>KOST ASYNC</Link>
        <div className="flex items-center gap-4">
          {userData ? (
            <>
              <span className="text-sm text-slate-400">Halo, <span className="text-slate-200 font-semibold">{userData.nama}</span></span>
              <Link to="/dashboard-user" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">Dashboard</Link>
              <button
                onClick={() => { localStorage.removeItem('user_token'); navigate('/') }}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors font-medium"
              >Keluar</button>
            </>
          ) : (
            <Link to="/login-user" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">Masuk / Daftar</Link>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <motion.div {...fadeInUp} className="mb-6">
          <h1 className="text-3xl font-black text-white mb-1">Form Pemesanan</h1>
          <p className="text-slate-400">Pilih kamar dan isi data untuk menyelesaikan pemesanan.</p>
        </motion.div>

        {/* Info Banner — Alur Kredensial */}
        <motion.div {...fadeInUp} className="mb-8">
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-indigo-300 font-bold text-sm mb-1">Cara Mendapatkan Akun</p>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">
                  Setelah memesan kamar dan admin <span className="text-slate-200 font-semibold">mengonfirmasi pembayaran</span>, kamu akan otomatis mendapatkan kredensial login.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Step 1 */}
                  <span className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Isi Form Pesan
                  </span>
                  {/* Arrow */}
                  <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {/* Step 2 */}
                  <span className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Admin Konfirmasi
                  </span>
                  {/* Arrow */}
                  <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {/* Step 3 */}
                  <span className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Dapat Akun Login
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert Sukses / Error */}
        <AnimatePresence>
          {sukses && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4"
            >
              <svg className="w-5 h-5 text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-green-300">Pemesanan berhasil dikirim</p>
                <p className="text-green-400/70 text-sm mt-0.5">
                  Admin akan segera memproses. Gunakan <strong className="text-green-300">Cek Status</strong> di bawah untuk mendapatkan info login setelah pembayaran dikonfirmasi.
                </p>
              </div>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-red-400 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PILIH KAMAR */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs flex items-center justify-center font-black">1</span>
            Pilih Kamar
          </h2>
          <motion.div {...staggerContainer} className="space-y-3">
            {kamar.length === 0 ? (
              <div className="bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700">
                <p className="text-slate-500 font-medium">Tidak ada kamar kosong saat ini.</p>
              </div>
            ) : kamar.map(k => (
              <motion.div
                key={k.id}
                {...hoverClick}
                onClick={() => handleKamarClick(k.id)}
                className={`flex justify-between items-center px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  form.id_kamar == k.id
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                    <img
                      src={getKamarImage(k)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = kamarDefaultImg }}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 flex items-center gap-2">
                      Kamar {k.nomor}
                      {form.id_kamar == k.id && (
                        <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded-full">Dipilih ✓</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-400 mt-0.5">{k.tipe} · {k.fasilitas}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${form.id_kamar == k.id ? 'text-cyan-400' : 'text-slate-200'}`}>
                    Rp {Number(k.harga).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-500">/bulan</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* FORM DATA */}
        <div id="form-section" className="mb-8">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs flex items-center justify-center font-black">2</span>
            Data Pemesanan
          </h2>
          <div className={`${cardUser} p-6`}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={darkLabel}>Nama Lengkap</label>
                <input name="nama" value={form.nama} onChange={handleChange} required className={darkInput} placeholder="Nama sesuai KTP" />
                {userData && <p className="text-xs text-slate-500 mt-1">Terisi otomatis dari akun kamu</p>}
              </div>
              <div>
                <label className={darkLabel}>No. HP / WhatsApp</label>
                <input
                  name="no_hp"
                  value={form.no_hp}
                  onChange={handleChange}
                  required
                  placeholder="08123456789"
                  className={`${darkInput} ${noHpError ? 'border-red-500/70 focus:ring-red-500/50' : ''}`}
                />
                {noHpError && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {noHpError}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={darkLabel}>Kamar</label>
                  <select name="id_kamar" value={form.id_kamar} onChange={handleChange} required
                    className={darkInput + ' cursor-pointer'}
                  >
                    <option value="">-- Pilih Kamar --</option>
                    {kamar.map(k => (
                      <option key={k.id} value={k.id}>Kamar {k.nomor} — Rp {Number(k.harga).toLocaleString('id-ID')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={darkLabel}>Tanggal Masuk</label>
                  <input name="tanggal_masuk" type="date" value={form.tanggal_masuk} onChange={handleChange} required
                    min={new Date().toISOString().split('T')[0]}
                    className={darkInput}
                  />
                </div>
              </div>
              <motion.button
                {...hoverClick}
                type="submit" disabled={submitting || !form.id_kamar}
                className={`w-full mt-2 py-4 ${btnUserPrimary} px-6 shadow-lg shadow-cyan-500/25 text-base disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    Kirim Pemesanan
                  </span>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* ─── CEK STATUS PEMESANAN ──────────────────────────────────── */}
        <motion.div {...fadeInUp} className={`${cardUser} p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-slate-200 font-bold">Cek Status Pemesanan</h3>
              <p className="text-xs text-slate-500">Sudah booking? Masukkan No. HP untuk cek status &amp; dapat info login</p>
            </div>
          </div>

          <form onSubmit={handleCekStatus} className="flex gap-3">
            <input
              type="tel"
              placeholder="No. HP yang didaftarkan (cth: 08123...)"
              value={noHpCek}
              onChange={e => { setNoHpCek(e.target.value); setCekError(''); setCekStatusMsg('') }}
              required
              className={darkInput + ' flex-1 text-sm'}
            />
            <motion.button
              {...hoverClick}
              type="submit"
              disabled={isCekLoading}
              className={`px-5 py-3 ${btnUserPrimary} text-sm whitespace-nowrap disabled:opacity-60`}
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
            </motion.button>
          </form>

          <AnimatePresence>
            {cekError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2"
              >
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-400 font-medium">{cekError}</p>
              </motion.div>
            )}
            {cekStatusMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2"
              >
                <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-300 font-medium">{cekStatusMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  )
}

export default PemesananUser
