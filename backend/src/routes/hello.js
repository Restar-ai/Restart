import { Router } from 'express'
import { getHello, postEcho } from '../controllers/helloController.js'

const router = Router()

// GET /api/hello
router.get('/hello', getHello)

// POST /api/echo
router.post('/echo', postEcho)

export default router