import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api'
import { fadeInUp } from '../../utils/animations'
import { cardUser, inputUser, labelUser, btnUserPrimary, badgeUser } from '../../utils/themeUser'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import SidebarUser from '../../components/SidebarUser'

function PindahKamarUser() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('')
  const [data, setData] = useState(null)
  const [availableRooms, setAvailableRooms] = useState([])
  const [pindahForm, setPindahForm] = useState({ id_kamar: '', alasan: '' })
  const [isKamarOpen, setIsKamarOpen] = useState(false)
  const lastNotifiedId = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('user_token')
    if (!token) { navigate('/login-user'); return }

    api.get('/api/user-dashboard/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setData(res.data)
      if (res.data.status !== 'active') {
        navigate('/dashboard-user')
      }
    }).catch(() => {
      localStorage.removeItem('user_token')
      navigate('/login-user')
    })

    api.get('/api/user-dashboard/available-rooms', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAvailableRooms(res.data)).catch(() => {})
  }, [navigate])

  useEffect(() => {
    const rp = data?.request_pindah
    if (!rp || rp.status === 'pending') return
    if (rp.id === lastNotifiedId.current) return
    lastNotifiedId.current = rp.id

    if (rp.status === 'disetujui') {
      Swal.fire({ icon: 'success', title: 'Pindah Kamar Disetujui!', text: `Pindah ke Kamar ${rp.nomor_kamar_baru} telah disetujui!`, background: '#1e293b', color: '#fff', confirmButtonColor: '#06b6d4' })
    } else if (rp.status === 'ditolak') {
      Swal.fire({ icon: 'error', title: 'Pindah Kamar Ditolak', text: 'Pengajuan pindah kamar kamu ditolak oleh admin.', background: '#1e293b', color: '#fff', confirmButtonColor: '#06b6d4' })
    }
  }, [data?.request_pindah])

  useEffect(() => {
    const token = localStorage.getItem('user_token')
    if (!token) return
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const interval = setInterval(() => {
      api.get('/api/user-dashboard/me', config).then(res => setData(res.data)).catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pindahForm.id_kamar) return toast.error('Pilih kamar terlebih dahulu!')
    try {
      const token = localStorage.getItem('user_token')
      await api.post('/api/user-dashboard/request-move', pindahForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Request pindah kamar dikirim!', background: '#1e293b', color: '#fff', confirmButtonColor: '#06b6d4' })
      setPindahForm({ id_kamar: '', alasan: '' })
      const resMe = await api.get('/api/user-dashboard/me', { headers: { Authorization: `Bearer ${token}` } })
      setData(resMe.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim request')
    }
  }

  if (!data) return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const rp = data.request_pindah
  const darkLabel = labelUser + ' block mb-1.5'

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <SidebarUser activeTab={activeTab} setActiveTab={setActiveTab} status={data.status} />

      <main className="flex-1 max-h-screen overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-10 pb-24 md:pb-10 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <header className="mb-10">
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">Pindah Kamar</h1>
          <p className="text-slate-500 mt-1">Ajukan permintaan pindah ke kamar lain.</p>
        </header>

        <AnimatePresence mode="wait">
          {rp?.status === 'pending' && (
            <motion.div key="pending" {...fadeInUp} className={`${cardUser} p-6 sm:p-8 mb-6 border-l-4 border-l-amber-500`}>
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-amber-400 animate-pulse shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-amber-400 font-bold text-lg">Menunggu Persetujuan</p>
                  <p className="text-slate-400 text-sm">Kamu sudah mengajukan pindah ke <span className="text-white font-bold">Kamar {rp.nomor_kamar_baru}</span>.</p>
                </div>
              </div>
            </motion.div>
          )}

          {rp?.status === 'disetujui' && (
            <motion.div key="approved" {...fadeInUp} className={`${cardUser} p-6 sm:p-8 mb-6 border-l-4 border-l-emerald-500`}>
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-emerald-400 font-bold text-lg">Disetujui!</p>
                  <p className="text-slate-400 text-sm">Pindah ke <span className="text-white font-bold">Kamar {rp.nomor_kamar_baru}</span> telah disetujui.</p>
                </div>
              </div>
            </motion.div>
          )}

          {rp?.status === 'ditolak' && (
            <motion.div key="rejected" {...fadeInUp} className={`${cardUser} p-6 sm:p-8 mb-6 border-l-4 border-l-red-500`}>
              <div className="flex items-center gap-4 mb-4">
                <svg className="w-8 h-8 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <div>
                  <p className="text-red-400 font-bold text-lg">Ditolak</p>
                  <p className="text-slate-400 text-sm">Pengajuan pindah kamar kamu ditolak oleh admin. Silakan ajukan ulang.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(!rp || rp.status !== 'pending') && (
          <motion.div {...fadeInUp} className={`${cardUser} p-6 sm:p-8 max-w-lg`}>
            <h3 className="text-xl font-black text-white mb-2">Ajukan Pindah Kamar</h3>
            <p className="text-slate-400 text-sm mb-6">Pilih kamar kosong yang tersedia untuk dipindah.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative z-[60]">
                <label className={darkLabel}>Pilih Kamar Tujuan</label>
                <button
                  type="button"
                  onClick={() => setIsKamarOpen(!isKamarOpen)}
                  className={`${inputUser} w-full text-left flex justify-between items-center`}
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
                <textarea required rows="3" className={`${inputUser} w-full`} placeholder="Contoh: Ingin ganti suasana, cari yang lebih luas..." value={pindahForm.alasan} onChange={e => setPindahForm({...pindahForm, alasan: e.target.value})}></textarea>
              </div>
              <button type="submit" className={`w-full py-4 ${btnUserPrimary} flex justify-center`}>
                Kirim Request
              </button>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default PindahKamarUser
