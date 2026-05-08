import { useState, useEffect } from 'react'
import { getHelloMessage } from './api/helloApi'

function App() {
  const [status, setStatus] = useState({
    isLoading: true,
    message: 'Menghubungkan ke server...',
  })

  useEffect(() => {
    getHelloMessage()
      .then(data => {
        setStatus({
          isLoading: false,
          message: data.message,
        })
      })
      .catch(() => {
        setStatus({
          isLoading: false,
          message: 'Tidak bisa terhubung ke backend',
        })
      })
  }, [])

  return (
    <main className="min-h-svh bg-white p-8 text-slate-700">
      <section className="mx-auto max-w-xl">
        <p className="mb-2 text-sm font-semibold text-blue-600">Restart Career Platform</p>
        <h1 className="mb-4 text-3xl font-bold text-slate-900">React + Vite + Express</h1>
        <p className="mb-4">
          Pesan dari backend:
          {' '}
          <strong>{status.message}</strong>
        </p>
        <span
          className={[
            'inline-block rounded px-2 py-1 text-sm font-semibold',
            status.isLoading
              ? 'bg-slate-100 text-slate-600'
              : 'bg-blue-100 text-blue-700',
          ].join(' ')}
        >
          {status.isLoading ? 'Checking' : 'Connected'}
        </span>
      </section>
    </main>
  )
}

export default App
