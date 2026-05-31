import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAssessmentQuestions, submitAssessment } from '../api/assessmentApi'

export default function AssessmentPage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Fetch questions saat mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await getAssessmentQuestions()
        setQuestions(res.questions)
        
        // Initialize answers object
        const initialAnswers = {}
        res.questions.forEach((q) => {
          initialAnswers[q.id] = 3 // Default middle value
        })
        setAnswers(initialAnswers)
      } catch (err) {
        setError(err.message || 'Gagal memuat pertanyaan')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: parseInt(value)
    })
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await submitAssessment(answers, user.id)
      
      // Update localStorage user data
      localStorage.setItem(
        'user',
        JSON.stringify({ ...user, assessment_completed: true })
      )

      navigate('/assessment-result')
    } catch (err) {
      setError(err.message || 'Gagal menyimpan assessment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat pertanyaan...</p>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 py-6 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-1">Restart</h1>
          <p className="text-sm sm:text-base text-slate-600">Penilaian Kesesuaian Karir</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 border border-slate-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-5 sm:mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-600">
                Pertanyaan {currentQuestion + 1} dari {questions.length}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-slate-800 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Category */}
          {question && (
            <div className="mb-4 sm:mb-6">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                {question.label && <span className="font-semibold">{question.label} • </span>}
                {question.category === 'physical'
                  ? 'Fisik & Motorik'
                  : question.category === 'communication'
                  ? 'Komunikasi & Sosial'
                  : question.category === 'problem_solving'
                  ? 'Pemecahan Masalah'
                  : 'Tipe Kepribadian'}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Question */}
            {question && (
              <div className="mb-5 sm:mb-8">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 leading-snug">
                  {question.question}
                </h2>

                {/* Rating Scale */}
                <div className="space-y-2 sm:space-y-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label
                      key={value}
                      className="flex items-center p-3 sm:p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-slate-400 transition"
                      style={{
                        borderColor: answers[question.id] === value ? '#1e293b' : undefined,
                        backgroundColor: answers[question.id] === value ? '#f1f5f9' : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={value}
                        checked={answers[question.id] === value}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-4 h-4 text-slate-800 flex-shrink-0"
                      />
                      <span className="ml-3 text-sm sm:text-base text-slate-900 font-medium">
                        {value === 1 && 'Sangat Tidak Setuju'}
                        {value === 2 && 'Tidak Setuju'}
                        {value === 3 && 'Netral'}
                        {value === 4 && 'Setuju'}
                        {value === 5 && 'Sangat Setuju'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-5 sm:mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-300 text-slate-800 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Sebelumnya
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold rounded-lg transition"
                >
                  {submitting ? 'Memproses...' : 'Selesai'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition"
                >
                  Berikutnya
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
