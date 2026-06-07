import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Sidebar from "../../../components/Sidebar"
import api from "../../../api"
import { fadeInUp, hoverClick } from "../../../utils/animations"
import { inputStyle, labelStyle, btnPrimary } from "../../../utils/theme"

function AdminGantiPassword() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) {
      return toast.error("Konfirmasi password tidak cocok")
    }
    if (form.new_password.length < 8) {
      return toast.error("Password minimal 8 karakter")
    }
    const token = localStorage.getItem("token")
    try {
      await api.put("/api/users/password", {
        current_password: form.current_password,
        new_password: form.new_password
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success("Password berhasil diganti!")
      setForm({ current_password: "", new_password: "", confirm_password: "" })
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal ganti password")
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <motion.main variants={fadeInUp} initial="initial" animate="animate" className="flex-1 p-4 md:p-10 pb-20 md:pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800">Ganti Password</h1>
          <p className="text-slate-500 mt-1">Ubah password akun admin Anda.</p>
        </div>

        <div className="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className={labelStyle}>Password Lama</label>
              <input type="password" value={form.current_password} onChange={(e) => setForm({...form, current_password: e.target.value})} required className={inputStyle} placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <label className={labelStyle}>Password Baru</label>
              <input type="password" value={form.new_password} onChange={(e) => setForm({...form, new_password: e.target.value})} required className={inputStyle} placeholder="Minimal 8 karakter" />
            </div>
            <div className="space-y-1.5">
              <label className={labelStyle}>Konfirmasi Password Baru</label>
              <input type="password" value={form.confirm_password} onChange={(e) => setForm({...form, confirm_password: e.target.value})} required className={inputStyle} placeholder="Ulangi password baru" />
            </div>
            <motion.button {...hoverClick} type="submit" className={`${btnPrimary} w-full py-4`}>Simpan Password</motion.button>
          </form>
        </div>
      </motion.main>
    </div>
  )
}

export default AdminGantiPassword
