import express from 'express'
import cors from 'cors'
import helloRouter from './routes/hello.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({
  origin: CLIENT_URL,
}))
app.use(express.json())

app.use('/api', helloRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
