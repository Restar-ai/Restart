import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { registerUser } from '../api/authApi'

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirm: '',
    nik: '',
    gender: '',
    birth_date: '',
    address: ''
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm({
      ...form,
      [name]: value
    })
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
    setError('')
  }

  function validateForm() {
    const newErrors = {}

    if (!form.name.trim()) newErrors.name = 'Nama wajib diisi'
    if (!form.email.trim()) newErrors.email = 'Email wajib diisi'
    if (!form.nik.trim()) newErrors.nik = 'NIK wajib diisi'
    if (!form.gender) newErrors.gender = 'Jenis kelamin wajib dipilih'
    if (!form.birth_date) newErrors.birth_date = 'Tanggal lahir wajib diisi'
    if (!form.address.trim()) newErrors.address = 'Alamat wajib diisi'
    if (!form.password) newErrors.password = 'Password wajib diisi'
    if (form.password.length < 6) newErrors.password = 'Password minimal 6 karakter'
    if (!form.password_confirm) newErrors.password_confirm = 'Konfirmasi password wajib diisi'
    if (form.password !== form.password_confirm) newErrors.password_confirm = 'Password tidak cocok'

    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      await registerUser(form)

      // Clear form
      setForm({
        name: '',
        email: '',
        password: '',
        password_confirm: '',
        nik: '',
        gender: '',
        birth_date: '',
        address: ''
      })

      // Show success and redirect
      navigate('/')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,_#CCD8E6_0%,_#F7F6EE_52%,_#233B5E_160%)] py-8 px-4 flex items-center justify-center sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-[#233B5E]/20 blur-3xl" />
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {/* Logo / Title */}
        <div className="text-center mb-5">
          <h1 className="text-3xl font-bold tracking-tight text-[#233B5E] mb-1 sm:text-4xl">Restart</h1>
          <p className="text-xs tracking-[0.24em] text-[#233B5E] sm:text-sm">CAREER PLATFORM</p>
          <p className="mt-2 text-sm text-slate-600">Mulai perjalanan karier Anda dengan Restart.</p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-white/60 bg-white/88 p-5 shadow-[0_24px_70px_rgba(35,59,94,0.16)] backdrop-blur-md sm:p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[#233B5E] mb-2">Daftar Akun</h2>
          <p className="text-slate-500 mb-5 text-sm">Buat akun baru untuk memulai</p>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#CCD8E6] ${
                  errors.name ? 'border-red-500' : 'border-slate-200'
                } bg-white`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                placeholder="contoh@email.com"
                value={form.email}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#CCD8E6] ${
                  errors.email ? 'border-red-500' : 'border-slate-200'
                } bg-white`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* NIK */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NIK *</label>
              <input
                type="text"
                name="nik"
                placeholder="16 digit NIK"
                value={form.nik}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#CCD8E6] ${
                  errors.nik ? 'border-red-500' : 'border-slate-200'
                } bg-white`}
              />
              {errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik}</p>}
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin *</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#CCD8E6] ${
                  errors.gender ? 'border-red-500' : 'border-slate-200'
                } bg-white`}
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
                <option value="other">Lainnya</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir *</label>
              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#CCD8E6] ${
                  errors.birth_date ? 'border-red-500' : 'border-slate-200'
                } bg-white`}
              />
              {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date}</p>}
            </div>

            {/* Alamat */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat *</label>
              <textarea
                name="address"
                placeholder="Jl. Example, No. 123"
                value={form.address}
                onChange={handleChange}
                rows="2"
                className={`w-full rounded-xl border px-4 py-3 text-sm resize-none text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#CCD8E6] ${
                  errors.address ? 'border-red-500' : 'border-slate-200'
                } bg-white`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 pr-10 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#CCD8E6] ${
                    errors.password ? 'border-red-500' : 'border-slate-200'
                  } bg-white`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-[#233B5E]"
                >
                  {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirm"
                  placeholder="••••••••"
                  value={form.password_confirm}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 pr-10 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#CCD8E6] ${
                    errors.password_confirm ? 'border-red-500' : 'border-slate-200'
                  } bg-white`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-[#233B5E]"
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
              {errors.password_confirm && <p className="text-red-500 text-xs mt-1">{errors.password_confirm}</p>}
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-xl bg-[#233B5E] py-3.5 font-semibold text-white transition hover:bg-[#1f344f] disabled:bg-slate-400"
              >
                {loading ? 'Sedang mendaftar...' : 'Daftar'}
              </button>
            </div>

            <div className="md:col-span-2">
              <p className="text-center text-slate-600 text-sm">
                Sudah punya akun?{' '}
                <Link to="/" className="font-semibold text-[#233B5E] hover:text-[#1f344f]">
                  Login di sini
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}