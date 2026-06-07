import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import api from "../../api"
import { fadeInUp, hoverClick } from "../../utils/animations"
import { cardUser, inputUser, labelUser, btnUserPrimary } from "../../utils/themeUser"
import SidebarUser from "../../components/SidebarUser"

function KritikSaranUser() {
  const [form, setForm] = useState({ isi: "", rating: 5 })
  const [sending, setSending] = useState(false)

  const token = localStorage.getItem("user_token")
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.isi.trim()) return toast.error("Isi kritik & saran wajib diisi")
    setSending(true)
    try {
      await api.post("/api/kritik-saran", form, config)
      toast.success("Kritik & saran berhasil dikirim!")
      setForm({ isi: "", rating: 5 })
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim")
    } finally { setSending(false) }
  }

  const ratings = [1, 2, 3, 4, 5]

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <SidebarUser activeTab="" setActiveTab={() => {}} status="" />
      <main className="flex-1 max-h-screen overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-10 pb-24 md:pb-10 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <header className="mb-10">
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">Kritik & Saran</h1>
          <p className="text-slate-500 mt-1">Bantu kami lebih baik dengan masukan Anda.</p>
        </header>

        <div className="max-w-lg">
          <form onSubmit={handleSubmit} className={`${cardUser} p-6 space-y-5`}>
            <div className="space-y-1.5">
              <label className={labelUser}>Rating</label>
              <div className="flex gap-2">
                {ratings.map((r) => (
                  <button type="button" key={r} onClick={() => setForm({ ...form, rating: r })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                      form.rating >= r ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-800 text-slate-600 border border-slate-700"
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelUser}>Kritik & Saran</label>
              <textarea value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} required rows={6}
                className={`${inputUser} resize-none`} placeholder="Tulis masukkan, saran, atau kritik Anda di sini..."
              />
            </div>
            <motion.button {...hoverClick} type="submit" disabled={sending}
              className={`${btnUserPrimary} w-full py-4 flex items-center justify-center gap-2 ${sending ? "opacity-50" : ""}`}
            >
              {sending ? "Mengirim..." : "Kirim Masukan"}
            </motion.button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default KritikSaranUser
