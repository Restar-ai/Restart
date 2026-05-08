import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`)
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`)
})
