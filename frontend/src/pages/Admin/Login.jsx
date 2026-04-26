import { useState, useEffect } from 'react'
import api from '../../api'

import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // State baru untuk mengatur password terlihat atau tidak
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  // Kalau admin sudah login, langsung redirect ke dashboard
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && token !== 'null' && token !== 'undefined') {
      navigate('/dashboard', { replace: true })
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!username || !password) {
      setError('Username dan password wajib diisi')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await api.post('http://localhost:5000/api/auth/login', {
        username,
        password
      })

      localStorage.setItem('token', res.data.token)

      toast.success('Login berhasil')
      navigate('/dashboard', { replace: true })

    } catch (err) {
      setError('Username atau password salah!')
      toast.error('Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex justify-center items-center py-12 px-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-100">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-500">
            Masuk untuk mengelola sistem Kost Mewah.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-3 rounded-r-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="Masukkan username"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            {/* Bungkus input dengan relative agar icon bisa diposisikan absolute di dalamnya */}
            <div className="relative">
              <input
                // Tipe berubah otomatis berdasarkan state showPassword
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Masukkan password"
                // Tambahkan pr-12 (padding-right) agar teks tidak tertutup ikon
                className="w-full p-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all"
              />

              {/* Tombol icon mata */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? (
                  // Icon mata terbuka (SVG)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  // Icon mata tercoret (SVG)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-3.5 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 ${
              loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-gray-800 shadow-gray-900/20 hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </button>
        </form>

      </div>
    </div>
  )
}

export default Login