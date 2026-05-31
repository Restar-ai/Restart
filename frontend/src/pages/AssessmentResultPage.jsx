import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAssessmentResult } from '../api/assessmentApi'

const NAVY = '#233B5E'
const SOFT_BLUE = '#CCD8E6'
const CREAM = '#F7F6EE'

const RANK_LABELS = { 1: '1st', 2: '2nd', 3: '3rd' }

export default function AssessmentResultPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await getAssessmentResult(user.id)
        setResult(res.result)
      } catch (err) {
        setError(err.message || 'Gagal memuat hasil assessment')
      } finally {
        setLoading(false)
      }
    }

    if (user.id) {
      fetchResult()
    }
  }, [user.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: NAVY }}></div>
          <p style={{ color: NAVY }}>Memproses hasil assessment...</p>
        </div>
      </div>
    )
  }

  // Normalize recommendedJobs — support both string[] (rule-based) and object[] (ML)
  const normalizeJobs = (jobs) => {
    if (!Array.isArray(jobs) || jobs.length === 0) return []
    if (typeof jobs[0] === 'string') {
      return jobs.map((name, i) => ({ profession: name, confidence: null, rank: i + 1 }))
    }
    return jobs
  }

  const ScoreCard = ({ title, score, description }) => {
    const numScore = parseFloat(score)
    const scorePercentage = (numScore / 5) * 100
    return (
      <div className="rounded-xl p-4 sm:p-6 border" style={{ background: CREAM, borderColor: SOFT_BLUE }}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm sm:text-base font-semibold pr-2" style={{ color: NAVY }}>{title}</h3>
          <span className="text-xl sm:text-2xl font-bold flex-shrink-0" style={{ color: NAVY }}>{numScore.toFixed(1)}</span>
        </div>
        <p className="text-xs sm:text-sm mb-3" style={{ color: '#4A6080' }}>{description}</p>
        <div className="w-full rounded-full h-2" style={{ background: SOFT_BLUE }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${scorePercentage}%`, background: NAVY }}
          ></div>
        </div>
      </div>
    )
  }

  const ProfessionCard = ({ job, index }) => {
    const isML = job.confidence !== null
    const confidencePct = isML ? Math.round(job.confidence * 100) : null
    const rankLabel = RANK_LABELS[job.rank] || `#${job.rank}`

    return (
      <div
        className="rounded-xl border p-5 transition-shadow hover:shadow-md"
        style={{ background: CREAM, borderColor: index === 0 ? NAVY : SOFT_BLUE }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Rank badge */}
            <span
              className="w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
              style={{ background: index === 0 ? NAVY : SOFT_BLUE, color: index === 0 ? CREAM : NAVY }}
            >
              {rankLabel}
            </span>
            <p className="font-semibold text-base" style={{ color: NAVY }}>{job.profession}</p>
          </div>
          {isML && (
            <span className="text-sm font-bold" style={{ color: NAVY }}>
              {confidencePct}%
            </span>
          )}
        </div>

        {/* Confidence bar — only shown for ML predictions */}
        {isML && (
          <div className="w-full rounded-full h-2" style={{ background: SOFT_BLUE }}>
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${confidencePct}%`, background: NAVY }}
            ></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 px-4 sm:py-12 sm:px-6" style={{ background: CREAM }}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold mb-1" style={{ color: NAVY }}>Restart</h1>
          <p className="text-sm sm:text-base" style={{ color: '#4A6080' }}>Hasil Penilaian Karir Anda</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {result && (() => {
          const jobs = normalizeJobs(result.recommendedJobs)
          const isMLResult = jobs.length > 0 && jobs[0].confidence !== null

          return (
            <>
              {/* Score Summary */}
              <div className="rounded-2xl shadow-md p-4 sm:p-8 border mb-4 sm:mb-8" style={{ background: '#fff', borderColor: SOFT_BLUE }}>
                <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: NAVY }}>Ringkasan Skor</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <ScoreCard
                    title="Fisik & Motorik"
                    score={result.physicalScore}
                    description="Koordinasi, keseimbangan, dan kerja fisik"
                  />
                  <ScoreCard
                    title="Komunikasi & Sosial"
                    score={result.communicationScore}
                    description="Mendengarkan, berbicara, dan kerja tim"
                  />
                  <ScoreCard
                    title="Pemecahan Masalah"
                    score={result.problemSolvingScore}
                    description="Troubleshooting dan manajemen waktu"
                  />
                  <ScoreCard
                    title="Tipe Kepribadian"
                    score={result.personalityScore}
                    description="Gaya kepribadian (RIASEC)"
                  />
                </div>
              </div>

              {/* Job Recommendations */}
              <div className="rounded-2xl shadow-md p-4 sm:p-8 border mb-4 sm:mb-8" style={{ background: '#fff', borderColor: SOFT_BLUE }}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h2 className="text-lg sm:text-2xl font-bold" style={{ color: NAVY }}>
                    Rekomendasi Profesi
                  </h2>
                  {isMLResult && (
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: SOFT_BLUE, color: NAVY }}
                    >
                      Powered by AI
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: '#4A6080' }}>
                  Profesi yang paling sesuai dengan profil kemampuan dan kepribadian Anda:
                </p>
                <div className="flex flex-col gap-3">
                  {jobs.map((job, index) => (
                    <ProfessionCard key={index} job={job} index={index} />
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full font-semibold py-3 rounded-xl transition hover:opacity-90 text-sm sm:text-base"
                style={{ background: NAVY, color: CREAM }}
              >
                Lanjut ke Dashboard
              </button>
            </>
          )
        })()}
      </div>
    </div>
  )
}
