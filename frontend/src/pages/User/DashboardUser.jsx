import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { fadeInUp, hoverClick, staggerContainer } from '../../utils/animations'
import { btnPrimary, inputStyle, labelStyle, cardStyle, thStyle } from '../../utils/theme'
import { 
  cardUser, inputUser, labelUser, btnUserPrimary, thUser, badgeUser, textUserAccent, trUser 
} from '../../utils/themeUser'
import Swal from 'sweetalert2'
import SidebarUser from '../../components/SidebarUser'

function DashboardUser() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview') // overview | pengeluaran | history
  const [data, setData] = useState({ status: 'loading', penyewa: null, histori_pembayaran: [], latest_booking: null })
  const [pengeluaran, setPengeluaran] = useState([])
  
  // State form pengeluaran
  const [form, setForm] = useState({ kategori: 'Listrik', keterangan: '', jumlah: '', tanggal: new Date().toISOString().split('T')[0] })
  const [isKategoriOpen, setIsKategoriOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // State untuk Pindah Kamar
  const [isModalPindahOpen, setIsModalPindahOpen] = useState(false)
  const [isModalPengeluaranOpen, setIsModalPengeluaranOpen] = useState(false)
  const [availableRooms, setAvailableRooms] = useState([])
  const [pindahForm, setPindahForm] = useState({ id_kamar: '', alasan: '' })
  const [isKamarOpen, setIsKamarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('user_token')
    if (!token) { navigate('/login-user'); return }

    const config = { headers: { Authorization: `Bearer ${token}` } }

    Promise.all([
      axios.get('http://localhost:5000/api/user-dashboard/me', config),
      axios.get('http://localhost:5000/api/user-dashboard/pengeluaran', config)
    ])
    .then(([resMe, resPengeluaran]) => {
      setData(resMe.data)
      setPengeluaran(resPengeluaran.data)
      setLoading(false)
    })
    .catch((err) => {
      if(err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('user_token')
        navigate('/login-user')
      }
      setLoading(false)
    })
  }, [navigate])

  const handleAddPengeluaran = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('user_token')
    try {
      await axios.post('http://localhost:5000/api/user-dashboard/pengeluaran', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Refresh pengeluaran
      const res = await axios.get('http://localhost:5000/api/user-dashboard/pengeluaran', { headers: { Authorization: `Bearer ${token}` } })
      setPengeluaran(res.data)
      setForm({ ...form, keterangan: '', jumlah: '' })
      setIsModalPengeluaranOpen(false)
    } catch (err) {
      alert('Gagal menyimpan pengeluaran')
    }
  }

  const handleDeletePengeluaran = async (id) => {
    if (!window.confirm('Hapus catatan ini?')) return
    const token = localStorage.getItem('user_token')
    try {
      await axios.delete(`http://localhost:5000/api/user-dashboard/pengeluaran/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPengeluaran(pengeluaran.filter(p => p.id !== id))
    } catch (err) {
      alert('Gagal menghapus')
    }
  }

  const handleOpenPindahModal = async () => {
    try {
      const token = localStorage.getItem('user_token')
      const res = await axios.get('http://localhost:5000/api/user-dashboard/available-rooms', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAvailableRooms(res.data)
      setIsModalPindahOpen(true)
    } catch (err) {
      alert('Gagal mengambil daftar kamar')
    }
  }

  const handleSubmitPindah = async (e) => {
    e.preventDefault()
    if(!pindahForm.id_kamar) return alert('Pilih kamar terlebih dahulu!')
    try {
      const token = localStorage.getItem('user_token')
      await axios.post('http://localhost:5000/api/user-dashboard/request-move', pindahForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Request pindah kamar dikirim!', background: '#1e293b', color: '#fff' })
      setIsModalPindahOpen(false)
      // refresh data
      const resMe = await axios.get('http://localhost:5000/api/user-dashboard/me', { headers: { Authorization: `Bearer ${token}` } })
      setData(resMe.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim request')
    }
  }

  // Styles from themeUser
  const darkCard = cardUser
  const darkInput = inputUser
  const darkLabel = labelUser + ' block mb-1.5'

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
       <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
       <p className="mt-4 text-slate-400 font-medium">Memuat Dashboard...</p>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <SidebarUser activeTab={activeTab} setActiveTab={setActiveTab} status={data.status} />
      
      <main className="flex-1 max-h-screen overflow-y-auto custom-scrollbar p-6 sm:p-10 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <header className="mb-10">
           <h1 className="text-4xl font-black text-white tracking-tight uppercase">
             {activeTab === 'overview' ? 'Overview' : activeTab === 'pengeluaran' ? 'Buku Kas Pribadi' : 'Riwayat Sewa'}
           </h1>
           <p className="text-slate-500 mt-1">Halo Selamat Datang Kembali!</p>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" {...fadeInUp} className="space-y-6">
              
              {/* STATUS KAMAR */}
              <div className={`${darkCard} p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4`}>
                 <div>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Status Kost Kamu</p>
                   {data.status === 'active' ? (
                      <>
                        <h2 className="text-3xl font-black text-white">Kamar {data.penyewa?.nomor_kamar}</h2>
                        <p className="text-slate-400 text-sm mt-1">{data.penyewa?.fasilitas}</p>
                        {data.request_pindah ? (
                          <div className="mt-4 px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                            <p className="text-amber-400 text-xs font-bold leading-relaxed">
                              Menunggu persetujuan pindah ke<br/>
                              <span className="text-amber-300 text-sm font-black">Kamar {data.request_pindah.nomor_kamar_baru}</span>
                            </p>
                            <svg className="w-5 h-5 text-amber-500 animate-pulse ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                        ) : (
                          <button 
                            onClick={handleOpenPindahModal}
                            className="mt-4 px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 group"
                          >
                            <svg className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            Minta Pindah Kamar
                          </button>
                        )}
                      </>
                   ) : data.latest_booking?.status === 'menunggu_pembayaran' ? (
                      <>
                        <h2 className="text-2xl font-black text-blue-400">Menunggu Pembayaran</h2>
                        <div className="mt-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl max-w-sm">
                           <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1">Instruksi Bayar</p>
                           <p className="text-slate-300 text-xs leading-relaxed">Transfer sewa pertama ke <b>BCA 123456789 a/n KOST ASYNC</b>, lalu konfirmasi ke Admin.</p>
                        </div>
                      </>
                   ) : data.latest_booking ? (
                      <>
                        <h2 className="text-2xl font-black text-amber-400">Menunggu Persetujuan</h2>
                        <p className="text-slate-400 text-sm mt-1">Kamu telah request Kamar {data.latest_booking.nomor_kamar}. Silakan tunggu admin memprosesnya.</p>
                      </>
                   ) : (
                      <>
                        <h2 className="text-2xl font-black text-red-400">Belum Punya Kamar</h2>
                        <p className="text-slate-400 text-sm mt-1">Silakan booking kamar terlebih dahulu di katalog.</p>
                      </>
                   )}
                 </div>
                 {data.status === 'active' && (
                   <div className="bg-cyan-500/10 border border-cyan-500/20 px-6 py-4 rounded-2xl text-right">
                      <p className="text-cyan-300 text-sm font-bold">Tarif per Bulan</p>
                      <p className="text-2xl font-black text-white">Rp {Number(data.penyewa?.harga).toLocaleString('id-ID')}</p>
                   </div>
                 )}
                 {data.status === 'no_active_room' && !data.latest_booking && (
                   <Link to="/katalog" className={`px-6 py-3 ${btnUserPrimary}`}>Cari Kamar</Link>
                 )}
              </div>

              {/* QUICK STATS */}
              {data.status === 'active' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className={`${darkCard} p-6 border-l-4 border-l-cyan-500`}>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Bayar Kost</p>
                     <p className="text-2xl font-black text-white mt-1">
                        Rp {data.histori_pembayaran.filter(p=>p.status==='lunas').reduce((acc,curr)=>acc+Number(curr.jumlah), 0).toLocaleString('id-ID')}
                     </p>
                  </div>
                  <div className={`${darkCard} p-6 border-l-4 border-l-indigo-500`}>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Pengeluaran Kas</p>
                     <p className="text-2xl font-black text-white mt-1">
                        Rp {pengeluaran.reduce((acc, curr) => acc + Number(curr.jumlah), 0).toLocaleString('id-ID')}
                     </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'pengeluaran' && (
            <motion.div key="pengeluaran" {...fadeInUp} className="space-y-6">
              
              {/* HEADER ACTION */}
              <div className="flex justify-end">
                <motion.button 
                  {...hoverClick}
                  onClick={() => setIsModalPengeluaranOpen(true)}
                  className={`px-6 py-3 ${btnUserPrimary} flex items-center gap-2 shadow-lg shadow-cyan-500/20`}
                >
                  <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Catatan
                </motion.button>
              </div>

              {/* DAFTAR PENGELUARAN */}
              <div className={`${darkCard} overflow-hidden flex flex-col`}>
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/20">
                  <h3 className="text-lg font-bold text-white">Buku Kas Pribadi</h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 sticky top-0 z-10">
                        <tr>
                          <th className={thUser}>Tanggal</th>
                          <th className={thUser}>Kategori</th>
                          <th className={thUser}>Keterangan</th>
                          <th className={`${thUser} text-right`}>Jumlah</th>
                          <th className={`${thUser} text-center`}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {pengeluaran.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-500 italic">Belum ada catatan pengeluaran pribadi</td></tr>
                      ) : pengeluaran.map(p => (
                        <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 px-6 text-slate-400 text-sm whitespace-nowrap">{new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                          <td className="p-4 px-6">
                              <span className={badgeUser(p.kategori === 'Listrik' ? 'amber' : 'cyan')}>
                                 {p.kategori}
                              </span>
                          </td>
                          <td className="p-4 px-6 text-slate-200 font-medium">{p.keterangan}</td>
                          <td className="p-4 px-6 text-white font-black text-right">Rp {Number(p.jumlah).toLocaleString('id-ID')}</td>
                          <td className="p-4 px-6 text-center">
                            <button onClick={() => handleDeletePengeluaran(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all group">
                               <svg className="w-4 h-4 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                               </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" {...fadeInUp} className="space-y-6">
               <div className={`${darkCard} overflow-hidden`}>
                  <div className="p-6 border-b border-slate-700/50 bg-slate-800/20">
                    <h3 className="text-lg font-bold text-white">Riwayat Sewa Kamar</h3>
                    <p className="text-slate-500 text-sm">Berikut adalah seluruh transaksi pembayaran kost kamu.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 border-b border-slate-800">
                        <tr>
                          <th className={thUser}>Bulan Tagihan</th>
                          <th className={thUser}>Tgl Bayar</th>
                          <th className={thUser}>Metode</th>
                          <th className={thUser}>Nominal</th>
                          <th className={thUser}>Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {data.histori_pembayaran.length === 0 ? (
                          <tr><td colSpan="5" className="p-12 text-center text-slate-500 italic font-medium">Belum ada riwayat pembayaran yang tercatat.</td></tr>
                        ) : data.histori_pembayaran.map(p => (
                          <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-6 text-white font-black">{new Date(p.bulan).toLocaleDateString('id-ID', {year:'numeric', month:'long'})}</td>
                            <td className="p-6 text-slate-400 text-sm">{p.tanggal_bayar ? new Date(p.tanggal_bayar).toLocaleDateString('id-ID') : '-'}</td>
                            <td className="p-6"><span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-black uppercase text-slate-300">{p.metode_bayar}</span></td>
                            <td className="p-6 text-cyan-400 font-black">Rp {Number(p.jumlah).toLocaleString('id-ID')}</td>
                            <td className="p-6">
                               <span className={badgeUser(p.status === 'lunas' ? 'emerald' : 'amber')}>
                                 {p.status}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL PINDAH KAMAR */}
        <AnimatePresence>
          {isModalPindahOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className={`${darkCard} w-full max-w-md p-6 overflow-hidden relative`}>
                  <button type="button" onClick={() => setIsModalPindahOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <h3 className="text-xl font-black text-white mb-2">Request Pindah Kamar</h3>
                  <p className="text-slate-400 text-sm mb-6">Pilih kamar kosong yang tersedia untuk dipindah.</p>

                  <form onSubmit={handleSubmitPindah} className="space-y-4">
                    <div className="relative z-[60]">
                      <label className={darkLabel}>Pilih Kamar Tujuan</label>
                      <button
                        type="button"
                        onClick={() => setIsKamarOpen(!isKamarOpen)}
                        className={`${darkInput} w-full text-left flex justify-between items-center`}
                      >
                        <span className={pindahForm.id_kamar ? 'text-slate-100' : 'text-slate-500'}>
                          {pindahForm.id_kamar
                            ? (() => { const k = availableRooms.find(r => String(r.id) === String(pindahForm.id_kamar)); return k ? `Kamar ${k.nomor} (${k.tipe}) - Rp ${Number(k.harga).toLocaleString('id-ID')}` : '-- Silakan Pilih --'; })()
                            : '-- Silakan Pilih --'
                          }
                        </span>
                        <span className="text-[10px] opacity-60 ml-2 shrink-0">▼</span>
                      </button>
                      <AnimatePresence>
                        {isKamarOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 left-0 right-0 z-[70] bg-slate-800 border border-slate-700 shadow-xl rounded-2xl p-2 flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar"
                          >
                            {availableRooms.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-slate-500 italic">Tidak ada kamar tersedia</p>
                            ) : availableRooms.map((k) => (
                              <button
                                key={k.id}
                                type="button"
                                onClick={() => {
                                  setPindahForm({ ...pindahForm, id_kamar: String(k.id) })
                                  setIsKamarOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                                  String(pindahForm.id_kamar) === String(k.id) ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'hover:bg-slate-700 text-slate-300'
                                }`}
                              >
                                Kamar {k.nomor} ({k.tipe}) — Rp {Number(k.harga).toLocaleString('id-ID')}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <label className={darkLabel}>Alasan Pindah</label>
                      <textarea required rows="3" className={`${darkInput} w-full`} placeholder="Contoh: Ingin ganti suasana, cari yang lebih luas..." value={pindahForm.alasan} onChange={e => setPindahForm({...pindahForm, alasan: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className={`w-full py-4 ${btnUserPrimary} flex justify-center !rounded-xl mt-6`}>
                      Kirim Request
                    </button>
                  </form>
               </motion.div>
            </motion.div>
          )}

          {/* MODAL TAMBAH PENGELUARAN */}
          {isModalPengeluaranOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className={`${darkCard} w-full max-w-md p-6 overflow-hidden relative shadow-2xl border-cyan-500/20`}>
                  <button type="button" onClick={() => setIsModalPengeluaranOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                    Catat Pengeluaran
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">Catat pengeluaran harian kamu untuk tracking biaya kost.</p>

                  <form onSubmit={handleAddPengeluaran} className="space-y-4">
                     <div className="relative z-[61]">
                       <label className={darkLabel}>Kategori</label>
                       <button
                         type="button"
                         onClick={() => setIsKategoriOpen(!isKategoriOpen)}
                         className={`${darkInput} w-full text-left flex justify-between items-center`}
                       >
                         <span>{form.kategori || "Pilih..."}</span>
                         <span className="text-[10px] opacity-60 ml-2 shrink-0">▼</span>
                       </button>
                       <AnimatePresence>
                         {isKategoriOpen && (
                           <motion.div
                             initial={{ opacity: 0, y: -10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -10 }}
                             className="absolute top-full mt-2 left-0 right-0 z-[70] bg-slate-800 border border-slate-700 shadow-xl rounded-2xl p-2 flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar"
                           >
                             {["Listrik", "Makan", "Laundry", "Galon", "Kebutuhan Mandi", "Lainnya"].map((opt) => (
                               <button
                                 key={opt}
                                 type="button"
                                 onClick={() => {
                                   setForm({ ...form, kategori: opt })
                                   setIsKategoriOpen(false)
                                 }}
                                 className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                                   form.kategori === opt ? "bg-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-700 text-slate-300"
                                 }`}
                               >
                                 {opt}
                               </button>
                             ))}
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                     <div>
                       <label className={darkLabel}>Keterangan</label>
                       <input placeholder="Cth: Beli token listrik" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className={darkInput} required/>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={darkLabel}>Jumlah (Rp)</label>
                          <input type="number" placeholder="50000" value={form.jumlah} onChange={(e) => setForm({...form, jumlah: e.target.value})} className={darkInput} required/>
                        </div>
                        <div>
                          <label className={darkLabel}>Tanggal</label>
                          <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className={darkInput} required/>
                        </div>
                     </div>
                     <motion.button {...hoverClick} type="submit" className={`w-full py-4 ${btnUserPrimary} mt-4 flex items-center justify-center gap-2`}>
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                       Simpan Catatan
                     </motion.button>
                  </form>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}

export default DashboardUser

