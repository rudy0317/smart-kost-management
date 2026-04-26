import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api'
import { Eye, EyeOff } from 'lucide-react'
import { fadeInUp, hoverClick, modalVariants } from '../../utils/animations'
import { inputStyle, labelStyle, btnPrimary } from '../../utils/theme'
import { inputUser, labelUser, btnUserPrimary, textUserAccent } from '../../utils/themeUser'

function LoginUser() {
  const navigate = useNavigate()

  // Kalau user sudah login, langsung redirect ke dashboard
  useEffect(() => {
    const token = localStorage.getItem('user_token')
    if (token && token !== 'null' && token !== 'undefined') {
      navigate('/dashboard-user', { replace: true })
    }
  }, [])
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    nama: '', email: '', no_hp: '', password: '', confirmPassword: ''
  })

  const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
  const handleRegisterChange = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/api/users/login', loginForm)
      localStorage.setItem('user_token', res.data.token)
      navigate('/dashboard-user', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Validasi No HP
    const phoneRegex = /^08[0-9]{8,11}$/
    if (registerForm.no_hp && !phoneRegex.test(registerForm.no_hp)) {
      return setError('Format Nomor HP tidak valid (Wajib 08... dan 10-13 digit)')
    }

    // Validasi Panjang Password
    if (registerForm.password.length < 8) {
      return setError('Password minimal harus 8 karakter!')
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      return setError('Password dan konfirmasi password tidak sama!')
    }
    setLoading(true)
    try {
      const res = await api.post('/api/users/register', {
        nama: registerForm.nama,
        email: registerForm.email,
        no_hp: registerForm.no_hp,
        password: registerForm.password,
      })
      localStorage.setItem('user_token', res.data.token)
      navigate('/dashboard-user', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const darkInput = inputUser
  const darkLabel = labelUser

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <motion.div
        {...fadeInUp}
        className="relative w-full max-w-md"
      >
        {/* Card — dark variant dari cardStyle */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden">

          {/* Logo */}
          <div className="px-8 pt-8 pb-4 text-center">
            <Link to="/" className="inline-block mb-4">
              <span className={`text-2xl ${textUserAccent}`}>
                KOST ASYNC
              </span>
            </Link>
            <p className="text-slate-400 text-sm">
              {tab === 'login' ? 'Selamat datang kembali!' : 'Cara mendapatkan akun di Kost Async'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="px-8 pb-2">
            <div className="flex bg-slate-800/60 rounded-2xl p-1">
              {['login', 'register'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError('') }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    tab === t
                      ? `${btnUserPrimary} shadow-lg shadow-cyan-500/30 px-4`
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'login' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>
          </div>

          <div className="px-8 flex justify-center">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 w-full px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Forms */}
          <div className="px-8 py-6">
            <AnimatePresence mode="wait">
              {tab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div>
                    <label className={darkLabel}>Email / No. HP</label>
                    <input name="email" value={loginForm.email}
                      onChange={handleLoginChange} required placeholder="email@kamu.com atau 081..."
                      className={darkInput}
                    />
                  </div>
                  <div className="relative">
                    <label className={darkLabel}>Password</label>
                    <input name="password" type={showLoginPassword ? "text" : "password"} value={loginForm.password}
                      onChange={handleLoginChange} required placeholder="••••••••"
                      className={darkInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 top-[38px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <motion.button
                    {...hoverClick}
                    type="submit" disabled={loading}
                    className={`w-full mt-2 py-3.5 ${btnUserPrimary} px-6 shadow-lg shadow-cyan-500/25 text-base disabled:opacity-60`}
                  >
                    {loading ? 'Memproses...' : 'Masuk'}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="register-info"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Info banner */}
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-cyan-300 font-bold text-sm mb-1">Akun dibuat otomatis oleh sistem</p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Kamu tidak perlu daftar manual. Akun akan <span className="text-slate-200 font-semibold">aktif otomatis</span> setelah admin mengonfirmasi pembayaran kamarmu.
                      </p>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3">
                    {[
                      { num: '1', title: 'Isi Form Pemesanan', desc: 'Pilih kamar dan lengkapi data diri kamu', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
                      { num: '2', title: 'Tunggu Konfirmasi Admin', desc: 'Admin akan memverifikasi dan menghubungimu', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                      { num: '3', title: 'Dapat Akun & Login', desc: 'Kredensial dikirim otomatis setelah pembayaran dikonfirmasi', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                    ].map(step => (
                      <div key={step.num} className="flex items-start gap-3 bg-slate-800/50 rounded-2xl px-4 py-3 border border-slate-700/50">
                        <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 ${step.color}`}>
                          {step.num}
                        </span>
                        <div>
                          <p className="text-slate-200 font-semibold text-sm">{step.title}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA ke form pesan */}
                  <motion.div {...hoverClick}>
                    <Link
                      to="/pesan"
                      className={`w-full mt-1 py-3.5 ${btnUserPrimary} px-6 shadow-lg shadow-cyan-500/25 text-base font-bold rounded-2xl flex items-center justify-center gap-2`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Pesan Kamar Sekarang
                    </Link>
                  </motion.div>

                  <p className="text-center text-slate-600 text-xs">
                    Sudah punya akun? Klik tab <span className="text-slate-400 font-semibold">Masuk</span> di atas.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <Link to="/" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginUser
