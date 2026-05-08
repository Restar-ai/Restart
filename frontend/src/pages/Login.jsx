import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { loginUser } from '../api/authApi'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await loginUser(form)

      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))

      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Restart</h1>
          <p className="text-slate-600 font-medium">Career Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Login</h2>
          <p className="text-slate-500 mb-6">Masuk ke akun Anda</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="contoh@email.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition bg-slate-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              {loading ? 'Sedang login...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-slate-600 mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-slate-800 font-semibold hover:text-slate-900">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}