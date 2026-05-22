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
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,_#CCD8E6_0%,_#F7F6EE_52%,_#233B5E_160%)] px-4 py-8 flex items-center justify-center">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-[#233B5E]/20 blur-3xl" />
      <section className="relative z-10 w-full max-w-sm rounded-3xl border border-white/60 bg-white/88 p-6 shadow-[0_24px_70px_rgba(35,59,94,0.16)] backdrop-blur-md sm:p-7">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/logo_restart.png"
            alt="Restart logo"
            className="mb-4 h-28 w-28 object-contain drop-shadow-[0_12px_30px_rgba(35,59,94,0.18)] sm:h-32 sm:w-32"
          />
          <p className="mt-1 text-sm tracking-[0.2em] text-[#233B5E]">
            CAREER PLATFORM
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            Masuk untuk melanjutkan aktivitas dengan tampilan yang sederhana dan elegan.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="contoh@email.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#CCD8E6] bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-400 focus:border-[#233B5E] focus:outline-none focus:ring-4 focus:ring-[#CCD8E6]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#CCD8E6] bg-white px-4 py-3 pr-12 text-slate-900 transition placeholder:text-slate-400 focus:border-[#233B5E] focus:outline-none focus:ring-4 focus:ring-[#CCD8E6]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#233B5E]"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#233B5E] px-4 py-3.5 font-semibold text-white transition hover:bg-[#1f344f] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Sedang login...' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-[#233B5E] transition hover:text-[#1f344f]">
            Daftar sekarang
          </Link>
        </p>
      </section>
    </main>
  )
}
