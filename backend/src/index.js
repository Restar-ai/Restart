import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helloRouter from './routes/hello.js'

const app = express()
const PORT = process.env.PORT || 3000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
}))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────
app.use('/api', helloRouter)

// Handler 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' })
})

// Handler error global
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`)
  console.log(`Mode: ${process.env.NODE_ENV}`)
})