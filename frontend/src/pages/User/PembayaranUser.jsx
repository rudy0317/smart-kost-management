import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import api from "../../api"
import { fadeInUp, hoverClick } from "../../utils/animations"
import { cardUser, inputUser, labelUser, btnUserPrimary, thUser, badgeUser } from "../../utils/themeUser"
import Swal from "sweetalert2"
import SidebarUser from "../../components/SidebarUser"

const metodeBayarOptions = ["Tunai/Cash", "Transfer Bank", "QRIS"]

function PembayaranUser() {
  const navigate = useNavigate()
  const [tagihan, setTagihan] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("loading")

  const token = localStorage.getItem("user_token")
  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    api.get("/api/user-dashboard/me", config).then(res => setStatus(res.data.status)).catch(() => {})
  }, [])

  const fetchTagihan = async () => {
    try {
      const res = await api.get("/api/user-dashboard/tagihan", config)
      setTagihan(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTagihan() }, [])

  const handleBayar = async (item) => {
    const { value: metode } = await Swal.fire({
      title: "Bayar Tagihan",
      text: `Konfirmasi pembayaran ${new Date(item.bulan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })} - Rp ${Number(item.jumlah).toLocaleString('id-ID')}`,
      input: "select",
      inputOptions: Object.fromEntries(metodeBayarOptions.map(m => [m, m])),
      inputPlaceholder: "Pilih metode bayar",
      showCancelButton: true,
      confirmButtonText: "Bayar",
      cancelButtonText: "Batal",
      background: "#0f172a",
      color: "#f1f5f9",
      confirmButtonColor: "#06b6d4",
      customClass: { popup: "border border-slate-700 rounded-2xl" }
    })
    if (!metode) return
    try {
      await api.post(`/api/user-dashboard/bayar-tagihan/${item.id}`, { metode_bayar: metode }, config)
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Pembayaran menunggu verifikasi admin", background: "#0f172a", color: "#fff", confirmButtonColor: "#06b6d4" })
      fetchTagihan()
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Terjadi kesalahan", background: "#0f172a", color: "#fff", confirmButtonColor: "#06b6d4" })
    }
  }

  if (status !== "active") return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-400 text-lg">Kamu belum punya kamar aktif.</p>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <SidebarUser activeTab="" setActiveTab={() => {}} status="active" />
      <main className="flex-1 max-h-screen overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-10 pb-24 md:pb-10 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <header className="mb-10">
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">Pembayaran</h1>
          <p className="text-slate-500 mt-1">Bayar tagihan kost kamu di sini.</p>
        </header>

        <div className={`${cardUser} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className={thUser}>Bulan Tagihan</th>
                  <th className={thUser}>Jumlah</th>
                  <th className={thUser}>Status</th>
                  <th className={`${thUser} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-400">Memuat...</td></tr>
                ) : tagihan.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">Tidak ada tagihan yang perlu dibayar</td></tr>
                ) : tagihan.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-6 text-white font-black">
                      {new Date(item.bulan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                    </td>
                    <td className="p-6 text-cyan-400 font-black">
                      Rp {Number(item.jumlah).toLocaleString('id-ID')}
                    </td>
                    <td className="p-6">
                      <span className={badgeUser(item.status === 'belum_lunas' ? 'amber' : 'cyan')}>
                        {item.status === 'belum_lunas' ? 'Belum Dibayar' : 'Menunggu Verifikasi'}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      {item.status === 'belum_lunas' && (
                        <motion.button {...hoverClick} onClick={() => handleBayar(item)} className={`px-5 py-2.5 ${btnUserPrimary} text-xs`}>
                          Bayar Sekarang
                        </motion.button>
                      )}
                      {item.status === 'menunggu_verifikasi' && (
                        <span className="text-slate-500 text-sm">Menunggu admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PembayaranUser
