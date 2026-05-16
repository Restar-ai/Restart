import express from 'express'
import {
  getAssessmentQuestions,
  submitAssessment,
  getAssessmentResult
} from '../controllers/assessmentController.js'

const router = express.Router()

router.get('/questions', getAssessmentQuestions)
router.post('/submit', submitAssessment)
router.post('/result', getAssessmentResult)

export default router
