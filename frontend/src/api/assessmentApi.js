import { api } from './client'

export async function getAssessmentQuestions() {
  return await api.get('/assessment/questions')
}

export async function submitAssessment(answers, userId) {
  return await api.post('/assessment/submit', {
    answers,
    user_id: userId
  })
}

export async function getAssessmentResult(userId) {
  return await api.post('/assessment/result', {
    user_id: userId
  })
}
