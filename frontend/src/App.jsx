import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'

function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-white p-8 text-slate-700">
      <section className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="mb-2 text-sm font-semibold text-blue-600">Restart Career Platform</p>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-lg font-semibold">Selamat datang, <span className="text-blue-600">{user.name}</span>!</p>
            <p className="text-sm text-slate-600 mt-2">Email: {user.email}</p>
            <p className="text-sm text-slate-600">Role: <span className="font-semibold uppercase">{user.role}</span></p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h2 className="text-xl font-bold mb-2">Profil</h2>
            <p className="text-slate-600">Kelola informasi profil Anda di sini</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h2 className="text-xl font-bold mb-2">Pengaturan</h2>
            <p className="text-slate-600">Atur preferensi dan keamanan akun</p>
          </div>
        </div>
      </section>
    </main>
  )
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
