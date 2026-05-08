import { useState, useEffect } from 'react'
import { api } from './api/client'

function App() {
  const [message, setMessage] = useState('Menghubungkan ke server...')

  useEffect(() => {
    api.get('/hello')
      .then(data => setMessage(data.message))
      .catch(() => setMessage('❌ Tidak bisa terhubung ke backend'))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>React + Vite + Express </h1>
      <p>Pesan dari backend: <strong>{message}</strong></p>
    </div>
  )
}

export default App