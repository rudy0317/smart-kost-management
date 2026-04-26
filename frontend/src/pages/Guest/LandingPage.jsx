import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../../api'
import { getKamarImage } from '../../utils/imageHelper'
import kamarDefaultImg from '../../assets/kamar_default.png'
import { btnUserPrimary, textUserAccent, cardUser } from '../../utils/themeUser'
import { motion } from 'framer-motion'
import { fadeInUp, hoverClick } from '../../utils/animations'

function LandingPage() {
  const navigate = useNavigate()
  const [kamar, setKamar] = useState([])

  useEffect(() => {
    // Ambil data kamar buat ditampilin di katalog
    const fetchKamar = async () => {
      const res = await api.get('http://localhost:5000/api/kamar')
      setKamar(res.data.filter(k => k.status === 'kosong'))
    }
    fetchKamar()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">

      {/* 1. HERO SECTION (Kartu Ucapan) */}
      <div className="relative h-[80vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Overlay Background (Bisa ganti pake foto kost lu) */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center"></div>

        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Selamat Datang di <span className={textUserAccent}>Kost Async</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed">
            Hunian eksklusif dengan fasilitas lengkap dan lokasi strategis.
            Temukan kenyamanan istirahat Anda bersama kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <a href="#katalog" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-all shadow-xl">
              Lihat Katalog
            </a>
            <motion.button
              {...hoverClick}
              onClick={() => navigate('/pesan')}
              className={`px-8 py-4 ${btnUserPrimary} rounded-full shadow-lg shadow-cyan-500/20`}
            >
              Pesan Sekarang
            </motion.button>
          </div>
        </div>
      </div>

      {/* 2. SECTION KATALOG */}
      <div id="katalog" className="py-20 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 px-4">
          <h2 className="text-4xl font-black text-white mb-4">Katalog Kamar Kami</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 to-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
           {kamar.length > 0 ? (
            kamar.map((k) => (
              <div key={k.id} className={`${cardUser} overflow-hidden hover:border-cyan-500/40 hover:shadow-cyan-500/5 transition-all duration-500 group`}>
                {/* Image Placeholder */}
                <div className="h-56 bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img
                    src={getKamarImage(k)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="Kamar"
                    onError={(e) => { e.target.src = kamarDefaultImg }}
                  />
                  <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                    {k.tipe}
                  </div>
                </div>

                <div className="p-6">
                   <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">Kamar {k.nomor}</h3>
                    <p className="text-cyan-400 font-extrabold">Rp {Number(k.harga).toLocaleString('id-ID')}</p>
                  </div>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                    {k.fasilitas || 'Fasilitas lengkap: WiFi, Kamar Mandi Dalam, Kasur, Lemari.'}
                  </p>
                   <motion.button
                    {...hoverClick}
                    onClick={() => navigate('/pesan')}
                    className={`w-full py-3 ${btnUserPrimary} text-sm`}
                  >
                    Booking Sekarang
                  </motion.button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
              <p className="text-gray-500 font-medium italic">Semua kamar sudah terisi penuh.</p>
            </div>
          )}
        </div>
      </div>

       {/* 3. FOOTER SEDERHANA */}
      <footer className="bg-slate-900/50 py-10 border-t border-slate-800">
        <div className="text-center text-slate-500 text-sm">
          © 2026 Kost Async Eksklusif. All rights reserved.
        </div>
      </footer>

    </div>
  )
}

export default LandingPage