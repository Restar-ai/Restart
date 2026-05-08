import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import helloRoutes from './routes/hello.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api', helloRoutes)

export default app