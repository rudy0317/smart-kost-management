import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function KatalogGuest() {
  const [kamar, setKamar] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKamar = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/kamar')
        setKamar(res.data)
        setLoading(false)
      } catch (err) {
        console.error("Gagal load kamar:", err)
        setLoading(false)
      }
    }
    fetchKamar()
  }, [])

  if (loading) return <div className="text-center mt-20 font-bold">Sabar bro, lagi loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Kost Camp</h1>
            <p className="text-gray-500">Temukan kamar ternyamanmu di sini.</p>
          </div>
        </div>

        {/* GRID KATALOG */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {kamar.map((k) => (
            <div key={k.id} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300">

              {/* BAGIAN GAMBAR */}
              <div className="h-56 bg-gray-200 relative">
                <img
                  src={k.foto_kamar || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'}
                  alt="Foto Kamar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg ${k.status === 'kosong' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {k.status === 'kosong' ? 'TERSEDIA' : 'PENUH'}
                  </span>
                </div>
              </div>

              {/* DETAIL INFO */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Kamar {k.nomor}</h3>
                <p className="text-indigo-600 font-bold text-sm mb-3 uppercase tracking-widest">{k.tipe}</p>

                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-black text-gray-900">Rp {Number(k.harga).toLocaleString('id-ID')}</span>
                  <span className="text-gray-400 text-sm ml-1">/bulan</span>
                </div>

                {/* TOMBOL AKSI */}
                {k.status === 'kosong' ? (
                  <Link
                    to="/pesan" // Arahin ke halaman form pemesanan lu
                    className="block w-full bg-gray-900 text-center text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 transition-colors"
                  >
                    Booking Sekarang
                  </Link>
                ) : (
                  <button disabled className="w-full bg-gray-200 text-gray-400 font-bold py-4 rounded-2xl cursor-not-allowed">
                    Sudah Terisi
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KatalogGuest