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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 py-12 px-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Restart</h1>
          
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Daftar Akun</h2>
          <p className="text-slate-500 mb-6 text-sm">Buat akun baru untuk memulai</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Scrollable Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition text-sm ${
                  errors.name ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50`}
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
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition text-sm ${
                  errors.email ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50`}
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
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition text-sm ${
                  errors.nik ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50`}
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
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition text-sm ${
                  errors.gender ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50`}
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
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition text-sm ${
                  errors.birth_date ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50`}
              />
              {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date}</p>}
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat *</label>
              <textarea
                name="address"
                placeholder="Jl. Example, No. 123"
                value={form.address}
                onChange={handleChange}
                rows="2"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition text-sm resize-none ${
                  errors.address ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50`}
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
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition text-sm pr-10 ${
                    errors.password ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
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
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition text-sm pr-10 ${
                    errors.password_confirm ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
              {errors.password_confirm && <p className="text-red-500 text-xs mt-1">{errors.password_confirm}</p>}
            </div>
          </form>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            {loading ? 'Sedang mendaftar...' : 'Daftar'}
          </button>

          {/* Login Link */}
          <p className="text-center text-slate-600 mt-6 text-sm">
            Sudah punya akun?{' '}
            <Link to="/" className="text-slate-800 font-semibold hover:text-slate-900">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}