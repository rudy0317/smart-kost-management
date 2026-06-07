import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import Sidebar from "../../../components/Sidebar"
import api from "../../../api"
import { fadeInUp, hoverClick, modalVariants, overlayVariants } from "../../../utils/animations"
import { btnPrimary, btnAmber, inputStyle, labelStyle, cardStyle, thStyle } from "../../../utils/theme"
import Swal from "sweetalert2"

function AdminPengumuman() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ judul: "", isi: "", status: "aktif" })

  const token = localStorage.getItem("token")
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const fetchData = async () => {
    try {
      const res = await api.get("/api/pengumuman", config)
      setData(res.data)
    } catch { toast.error("Gagal ambil data") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await api.put(`/api/pengumuman/${editId}`, form, config)
        toast.success("Pengumuman diupdate")
      } else {
        await api.post("/api/pengumuman", form, config)
        toast.success("Pengumuman ditambahkan")
      }
      setModalOpen(false)
      setEditId(null)
      setForm({ judul: "", isi: "", status: "aktif" })
      fetchData()
    } catch { toast.error("Gagal simpan pengumuman") }
  }

  const handleEdit = (item) => {
    setForm({ judul: item.judul, isi: item.isi, status: item.status })
    setEditId(item.id)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: "Hapus?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Ya, Hapus", cancelButtonText: "Batal" })
    if (!result.isConfirmed) return
    try {
      await api.delete(`/api/pengumuman/${id}`, config)
      toast.success("Dihapus")
      fetchData()
    } catch { toast.error("Gagal hapus") }
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <motion.main variants={fadeInUp} initial="initial" animate="animate" className="flex-1 p-4 md:p-10 pb-20 md:pb-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Pengumuman</h1>
            <p className="text-slate-500 mt-1">Kelola pengumuman kost.</p>
          </div>
          <motion.button {...hoverClick} onClick={() => { setEditId(null); setForm({ judul: "", isi: "", status: "aktif" }); setModalOpen(true) }} className={`${btnPrimary} px-6 py-3 flex items-center gap-2`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            Tambah
          </motion.button>
        </div>

        <div className={`${cardStyle} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 sticky top-0">
                <tr className="border-b border-slate-100">
                  <th className={thStyle}>Judul</th>
                  <th className={thStyle}>Status</th>
                  <th className={thStyle}>Tanggal</th>
                  <th className={`${thStyle} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-400">Memuat...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">Belum ada pengumuman</td></tr>
                ) : data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="p-4 px-6 font-bold text-slate-800">{item.judul}</td>
                    <td className="p-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-slate-500 text-sm">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">✏️</button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" onClick={() => setModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative bg-white w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
                <h3 className="text-2xl font-black text-slate-800 mb-6">{editId ? "Edit" : "Tambah"} Pengumuman</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className={labelStyle}>Judul</label>
                    <input name="judul" value={form.judul} onChange={(e) => setForm({...form, judul: e.target.value})} required className={inputStyle} placeholder="Judul pengumuman" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelStyle}>Isi</label>
                    <textarea name="isi" value={form.isi} onChange={(e) => setForm({...form, isi: e.target.value})} required rows={5} className={`${inputStyle} resize-none`} placeholder="Isi pengumuman..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelStyle}>Status</label>
                    <select name="status" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className={inputStyle}>
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Batal</button>
                    <motion.button {...hoverClick} type="submit" className={`flex-[2] py-4 ${editId ? btnAmber : btnPrimary}`}>{editId ? "Update" : "Simpan"}</motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  )
}

export default AdminPengumuman
