import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import Sidebar from "../../../components/Sidebar"
import api from "../../../api"
import { fadeInUp, hoverClick, modalVariants, overlayVariants } from "../../../utils/animations"
import { btnPrimary, btnAmber, inputStyle, labelStyle, cardStyle, thStyle } from "../../../utils/theme"
import Swal from "sweetalert2"

function AdminPelanggaran() {
  const [tab, setTab] = useState("aturan")
  const [aturan, setAturan] = useState([])
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ nama: "", deskripsi: "", sanksi: "" })

  const token = localStorage.getItem("token")
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const fetchAturan = async () => {
    try {
      const res = await api.get("/api/pelanggaran", config)
      setAturan(res.data)
    } catch { toast.error("Gagal ambil aturan") }
  }

  const fetchLaporan = async () => {
    try {
      const res = await api.get("/api/pelanggaran/laporan/all", config)
      setLaporan(res.data)
    } catch { toast.error("Gagal ambil laporan") }
  }

  useEffect(() => {
    Promise.all([fetchAturan(), fetchLaporan()]).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await api.put(`/api/pelanggaran/${editId}`, form, config)
        toast.success("Aturan diupdate")
      } else {
        await api.post("/api/pelanggaran", form, config)
        toast.success("Aturan ditambahkan")
      }
      setModalOpen(false); setEditId(null); setForm({ nama: "", deskripsi: "", sanksi: "" }); fetchAturan()
    } catch { toast.error("Gagal simpan") }
  }

  const handleEditAturan = (item) => {
    setForm({ nama: item.nama, deskripsi: item.deskripsi || "", sanksi: item.sanksi || "" })
    setEditId(item.id); setModalOpen(true)
  }

  const handleDeleteAturan = async (id) => {
    const result = await Swal.fire({ title: "Hapus?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Ya", cancelButtonText: "Batal" })
    if (!result.isConfirmed) return
    try { await api.delete(`/api/pelanggaran/${id}`, config); toast.success("Dihapus"); fetchAturan() }
    catch { toast.error("Gagal hapus") }
  }

  const handleUpdateLaporan = async (id, status) => {
    try { await api.put(`/api/pelanggaran/laporan/${id}`, { status }, config); toast.success("Laporan diupdate"); fetchLaporan() }
    catch { toast.error("Gagal update") }
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <motion.main variants={fadeInUp} initial="initial" animate="animate" className="flex-1 p-4 md:p-10 pb-20 md:pb-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Pelanggaran</h1>
            <p className="text-slate-500 mt-1">Kelola aturan & laporan pelanggaran.</p>
          </div>
          {tab === "aturan" && (
            <motion.button {...hoverClick} onClick={() => { setEditId(null); setForm({ nama: "", deskripsi: "", sanksi: "" }); setModalOpen(true) }} className={`${btnPrimary} px-6 py-3 flex items-center gap-2`}>
              + Aturan Baru
            </motion.button>
          )}
        </div>

        <div className="flex gap-2 mb-6 bg-slate-100 rounded-2xl p-1 w-fit">
          <button onClick={() => setTab("aturan")} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "aturan" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Aturan</button>
          <button onClick={() => setTab("laporan")} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "laporan" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Laporan Masuk ({laporan.length})</button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "aturan" && (
            <motion.div key="aturan" {...fadeInUp} className={`${cardStyle} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 sticky top-0">
                    <tr className="border-b border-slate-100">
                      <th className={thStyle}>Nama</th>
                      <th className={thStyle}>Deskripsi</th>
                      <th className={thStyle}>Sanksi</th>
                      <th className={`${thStyle} text-center`}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? <tr><td colSpan={4} className="p-12 text-center text-slate-400">Memuat...</td></tr>
                    : aturan.length === 0 ? <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">Belum ada aturan</td></tr>
                    : aturan.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/70">
                        <td className="p-4 px-6 font-bold text-slate-800">{a.nama}</td>
                        <td className="p-4 px-6 text-slate-600 text-sm">{a.deskripsi || "-"}</td>
                        <td className="p-4 px-6 text-slate-600 text-sm">{a.sanksi || "-"}</td>
                        <td className="p-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleEditAturan(a)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">✏️</button>
                            <button onClick={() => handleDeleteAturan(a.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab === "laporan" && (
            <motion.div key="laporan" {...fadeInUp} className={`${cardStyle} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 sticky top-0">
                    <tr className="border-b border-slate-100">
                      <th className={thStyle}>Pelapor</th>
                      <th className={thStyle}>Pelanggaran</th>
                      <th className={thStyle}>Deskripsi</th>
                      <th className={thStyle}>Tanggal</th>
                      <th className={thStyle}>Status</th>
                      <th className={`${thStyle} text-center`}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? <tr><td colSpan={6} className="p-12 text-center text-slate-400">Memuat...</td></tr>
                    : laporan.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-slate-400 italic">Belum ada laporan</td></tr>
                    : laporan.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/70">
                        <td className="p-4 px-6 font-medium text-slate-800">{l.nama_user}</td>
                        <td className="p-4 px-6 text-slate-600 font-medium">{l.nama_pelanggaran}</td>
                        <td className="p-4 px-6 text-slate-500 text-sm">{l.deskripsi || "-"}</td>
                        <td className="p-4 px-6 text-slate-500 text-sm">{new Date(l.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="p-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${l.status === 'dilapor' ? 'bg-amber-100 text-amber-700' : l.status === 'diproses' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{l.status}</span>
                        </td>
                        <td className="p-4 px-6 text-center">
                          {l.status === 'dilapor' && (
                            <button onClick={() => handleUpdateLaporan(l.id, 'diproses')} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all mr-1">Proses</button>
                          )}
                          {l.status !== 'selesai' && (
                            <button onClick={() => handleUpdateLaporan(l.id, 'selesai')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all">Selesai</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" onClick={() => setModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative bg-white w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
                <h3 className="text-2xl font-black text-slate-800 mb-6">{editId ? "Edit" : "Tambah"} Aturan</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className={labelStyle}>Nama Pelanggaran</label>
                    <input value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} required className={inputStyle} placeholder="Cth: Membawa Knalpot Brong" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelStyle}>Deskripsi</label>
                    <textarea value={form.deskripsi} onChange={(e) => setForm({...form, deskripsi: e.target.value})} rows={3} className={`${inputStyle} resize-none`} placeholder="Penjelasan..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelStyle}>Sanksi</label>
                    <textarea value={form.sanksi} onChange={(e) => setForm({...form, sanksi: e.target.value})} rows={3} className={`${inputStyle} resize-none`} placeholder="Cth: Denda Rp 50.000" />
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

export default AdminPelanggaran
