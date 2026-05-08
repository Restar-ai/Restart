import { Router } from 'express'
import { getHello, postEcho } from '../controllers/helloController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

// GET /api/hello
router.get('/hello', asyncHandler(getHello))

// POST /api/echo
router.post('/echo', asyncHandler(postEcho))

export default router
