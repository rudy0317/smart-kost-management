import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { fadeInUp, hoverClick, staggerContainer } from '../../utils/animations'
import { btnPrimary, cardStyle } from '../../utils/theme'
import { 
  btnUserPrimary, cardUser, textUserAccent, inputUser 
} from '../../utils/themeUser'
import { getKamarImage } from '../../utils/imageHelper'
import kamarDefaultImg from '../../assets/kamar_default.png'
import Swal from 'sweetalert2'

function KatalogGuest() {
  const navigate = useNavigate()
  const [kamar, setKamar] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('semua')
  const [search, setSearch] = useState('')

  const isUserLoggedIn = !!localStorage.getItem('user_token')

  useEffect(() => {
    axios.get('http://localhost:5000/api/kamar')
      .then(res => { setKamar(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleBooking = (kamarId) => {
    navigate('/pesan', { state: { id_kamar: kamarId } })
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Yakin mau keluar?",
      text: "Sesi Anda akan diakhiri.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      localStorage.removeItem('user_token');
      navigate('/');
    }
  }

  const filtered = kamar
    .filter(k => filter === 'semua' || k.status === filter)
    .filter(k =>
      search === '' ||
      k.nomor?.toString().includes(search) ||
      k.tipe?.toLowerCase().includes(search.toLowerCase()) ||
      k.fasilitas?.toLowerCase().includes(search.toLowerCase())
    )

  // Dark card — turunan dari cardStyle tapi untuk slate-950 background
  const darkCard = cardUser + " overflow-hidden hover:border-cyan-500/40 hover:shadow-cyan-500/5 transition-all duration-500 group"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className={`text-xl ${textUserAccent}`}>
            KOST ASYNC
          </Link>
          <div className="flex items-center gap-4">
            {isUserLoggedIn ? (
              <>
                <Link to="/dashboard-user" className="text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors">
                  Dashboard
                </Link>
                <motion.button
                  {...hoverClick}
                  onClick={() => navigate('/pesan')}
                  className={`px-4 py-2 ${btnUserPrimary} text-sm`}
                >
                  Booking
                </motion.button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors font-medium"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login-user" className="text-sm text-slate-400 hover:text-slate-200 transition-colors font-medium">
                  Masuk
                </Link>
                <Link to="/login-user" className={`px-4 py-2 ${btnPrimary} text-sm`}>
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="relative py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
        <motion.div {...fadeInUp}>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Katalog <span className={textUserAccent}>Kamar</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Temukan kamar impianmu. Harga terjangkau, fasilitas lengkap, lokasi strategis.
          </p>
        </motion.div>
      </div>

      {/* ── FILTER & SEARCH ── */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <motion.div
          {...fadeInUp}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          {/* Search */}
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nomor, tipe, atau fasilitas..."
              className={`${inputUser} pl-10 pr-4 py-3 text-sm`}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex bg-slate-800/60 rounded-2xl p-1 shrink-0">
            {[
              { val: 'semua', label: 'Semua' },
              { val: 'kosong', label: '✅ Tersedia' },
              { val: 'terisi', label: '🔴 Penuh' },
            ].map(f => (
              <button
                key={f.val}
                onClick={() => setFilter(f.val)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f.val
                    ? `${btnUserPrimary} px-4 shadow-lg shadow-cyan-500/20`
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── GRID KAMAR ── */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div {...fadeInUp} className="text-center py-20">
            <p className="text-slate-500 text-lg font-medium">Tidak ada kamar yang sesuai.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filtered.map((k, i) => (
                <motion.div
                  key={k.id}
                  variants={fadeInUp}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className={darkCard}
                >
                  {/* Gambar */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={getKamarImage(k)}
                      alt={`Kamar ${k.nomor}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { e.target.src = kamarDefaultImg }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                    {/* Badge status */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border ${
                        k.status === 'kosong'
                          ? 'bg-green-500/20 border-green-500/40 text-green-300'
                          : 'bg-red-500/20 border-red-500/40 text-red-300'
                      }`}>
                        {k.status === 'kosong' ? '✅ Tersedia' : '🔴 Penuh'}
                      </span>
                    </div>

                    {/* Badge tipe */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs font-bold text-slate-300 border border-slate-700">
                        {k.tipe}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-black text-white">Kamar {k.nomor}</h3>
                      <div className="text-right">
                        <p className="text-cyan-400 font-black">Rp {Number(k.harga).toLocaleString('id-ID')}</p>
                        <p className="text-xs text-slate-500">/bulan</p>
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm mb-5 line-clamp-2">
                      {k.fasilitas || 'WiFi, Kamar Mandi Dalam, Kasur, Lemari, AC'}
                    </p>

                    {k.status === 'kosong' ? (
                      <motion.button
                        {...hoverClick}
                        onClick={() => handleBooking(k.id)}
                        className={`w-full py-3 ${btnUserPrimary} px-4 text-sm shadow-lg shadow-cyan-500/20`}
                      >
                        {isUserLoggedIn ? '🏠 Booking Sekarang' : '🏠 Booking Kamar'}
                      </motion.button>
                    ) : (
                      <button disabled
                        className="w-full py-3 bg-slate-700/50 text-slate-500 font-bold rounded-2xl cursor-not-allowed text-sm border border-slate-700"
                      >
                        Sudah Terisi
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── BANNER BAWAH (kalau belum login) ── */}
      {!isUserLoggedIn && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, ...fadeInUp.transition }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4"
        >
          <div className="max-w-xl mx-auto bg-slate-800/90 backdrop-blur-xl border border-indigo-500/30 rounded-[2rem] px-5 py-4 flex items-center justify-between shadow-2xl shadow-indigo-500/10">
            <div>
              <p className="text-sm font-bold text-slate-200">Mau booking tanpa daftar dulu?</p>
              <p className="text-xs text-slate-400">Bisa langsung booking &amp; cek status di halaman pemesanan</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/pesan')}
                className="px-4 py-2 text-sm font-bold text-cyan-400 hover:text-white border border-cyan-500/40 hover:border-cyan-400 rounded-2xl transition-all"
              >
                Booking
              </button>
              <Link to="/login-user" className={`px-5 py-2.5 ${btnUserPrimary} text-sm shrink-0`}>
                Login
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default KatalogGuest