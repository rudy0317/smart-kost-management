import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import api from "../../api"
import { fadeInUp } from "../../utils/animations"
import { cardUser, textUserAccent } from "../../utils/themeUser"
import SidebarUser from "../../components/SidebarUser"

function PengumumanUser() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("user_token")
  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    api.get("/api/pengumuman?status=aktif", config)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <SidebarUser activeTab="" setActiveTab={() => {}} status="" />
      <main className="flex-1 max-h-screen overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-10 pb-24 md:pb-10 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <header className="mb-10">
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">Pengumuman</h1>
          <p className="text-slate-500 mt-1">Informasi terbaru dari pengelola kost.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">Belum ada pengumuman.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item, i) => (
              <motion.div
                key={item.id}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: i * 0.05 }}
                className={`${cardUser} p-6`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-black text-white">{item.judul}</h3>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                    {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{item.isi}</p>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default PengumumanUser
