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
  const [loading, setLoading] = useState(true)

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
                        <button 
                          onClick={() => alert("Fitur Pindah Kamar segera hadir! Silakan hubungi Admin.")}
                          className="mt-4 px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                           🔄 Minta Pindah Kamar
                        </button>
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
            <motion.div key="pengeluaran" {...fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* FORM TAMBAH PENGELUARAN */}
              <div className={`${darkCard} p-6 lg:col-span-1 h-fit shadow-xl`}>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                   Catat Pengeluaran
                </h3>
                <form onSubmit={handleAddPengeluaran} className="space-y-4">
                   <div>
                     <label className={darkLabel}>Kategori</label>
                     <select name="kategori" value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})} className={darkInput}>
                       <option>Listrik</option>
                       <option>Makan</option>
                       <option>Laundry</option>
                       <option>Galon</option>
                       <option>Kebutuhan Mandi</option>
                       <option>Lainnya</option>
                     </select>
                   </div>
                   <div>
                     <label className={darkLabel}>Keterangan</label>
                     <input placeholder="Cth: Beli token listrik" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className={darkInput} required/>
                   </div>
                   <div>
                     <label className={darkLabel}>Jumlah (Rp)</label>
                     <input type="number" placeholder="50000" value={form.jumlah} onChange={(e) => setForm({...form, jumlah: e.target.value})} className={darkInput} required/>
                   </div>
                   <div>
                     <label className={darkLabel}>Tanggal</label>
                     <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className={darkInput} required/>
                   </div>
                   <motion.button {...hoverClick} type="submit" className={`w-full py-4 ${btnUserPrimary} mt-2`}>
                     🏠 Simpan Catatan
                   </motion.button>
                </form>
              </div>

              {/* DAFTAR PENGELUARAN */}
              <div className={`${darkCard} lg:col-span-2 overflow-hidden flex flex-col`}>
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/20">
                  <h3 className="text-lg font-bold text-white">Buku Kas Pribadi</h3>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
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
      </main>
    </div>
  )
}

export default DashboardUser

