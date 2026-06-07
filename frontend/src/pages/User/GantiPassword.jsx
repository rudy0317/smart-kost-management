import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../api'
import { fadeInUp } from '../../utils/animations'
import { cardUser, inputUser, labelUser, btnUserPrimary } from '../../utils/themeUser'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import SidebarUser from '../../components/SidebarUser'

function GantiPassword() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('')
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })

  useEffect(() => {
    const token = localStorage.getItem('user_token')
    if (!token) { navigate('/login-user'); return }

    api.get('/api/user-dashboard/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data)).catch(() => {
      localStorage.removeItem('user_token')
      navigate('/login-user')
    })
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }
    if (form.new_password.length < 8) {
      toast.error('Password baru minimal 8 karakter')
      return
    }

    try {
      const token = localStorage.getItem('user_token')
      await api.put('/api/users/password', {
        current_password: form.current_password,
        new_password: form.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Password berhasil diganti',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#06b6d4'
      })
      setForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengganti password')
    }
  }

  if (!data) return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <SidebarUser activeTab={activeTab} setActiveTab={setActiveTab} status={data.status} />

      <main className="flex-1 max-h-screen overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-10 pb-24 md:pb-10 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <motion.div {...fadeInUp} className="max-w-lg mx-auto pt-10">
          <div className={`${cardUser} p-8`}>
            <h1 className="text-2xl font-black text-white mb-2">Ganti Password</h1>
            <p className="text-slate-400 text-sm mb-8">Masukkan password lama dan password baru kamu.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`${labelUser} block mb-1.5`}>Password Lama</label>
                <input
                  type="password"
                  className={inputUser}
                  placeholder="Masukkan password lama"
                  value={form.current_password}
                  onChange={e => setForm({...form, current_password: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className={`${labelUser} block mb-1.5`}>Password Baru</label>
                <input
                  type="password"
                  className={inputUser}
                  placeholder="Minimal 8 karakter"
                  value={form.new_password}
                  onChange={e => setForm({...form, new_password: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className={`${labelUser} block mb-1.5`}>Konfirmasi Password Baru</label>
                <input
                  type="password"
                  className={inputUser}
                  placeholder="Ulangi password baru"
                  value={form.confirm_password}
                  onChange={e => setForm({...form, confirm_password: e.target.value})}
                  required
                />
              </div>

              <button type="submit" className={`w-full py-4 ${btnUserPrimary} flex justify-center`}>
                Simpan Password
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default GantiPassword
