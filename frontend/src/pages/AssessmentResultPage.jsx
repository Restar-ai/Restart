import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAssessmentResult } from '../api/assessmentApi'

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
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memproses hasil assessment...</p>
        </div>
      </div>
    )
  }

  const ScoreCard = ({ title, score, description }) => {
    const numScore = parseFloat(score)
    const scorePercentage = (numScore / 5) * 100
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <span className="text-2xl font-bold text-slate-800">{numScore.toFixed(1)}</span>
        </div>
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        <div className="w-full bg-slate-300 rounded-full h-3">
          <div
            className="bg-slate-800 h-3 rounded-full transition-all duration-500"
            style={{ width: `${scorePercentage}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 py-12 px-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Restart</h1>
          <p className="text-slate-600 mb-4">Hasil Penilaian Karir Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <>
            {/* Score Summary */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Ringkasan Skor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScoreCard
                  title="Kemampuan Fisik & Motorik"
                  score={result.physicalScore}
                  description="Kecakapan dalam pekerjaan fisik, keseimbangan, dan koordinasi tangan"
                />
                <ScoreCard
                  title="Kemampuan Komunikasi & Sosial"
                  score={result.communicationScore}
                  description="Kemampuan mendengarkan, berbicara, dan bekerja dalam tim"
                />
                <ScoreCard
                  title="Kemampuan Pemecahan Masalah"
                  score={result.problemSolvingScore}
                  description="Kemampuan troubleshooting, manajemen waktu, dan fokus pada target"
                />
                <ScoreCard
                  title="Tipe Kepribadian"
                  score={result.personalityScore}
                  description="Preferensi kerja dan gaya kepribadian Anda (RIASEC)"
                />
              </div>
            </div>

            {/* Job Recommendations */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Rekomendasi Pekerjaan yang Cocok untuk Anda
              </h2>
              <p className="text-slate-600 mb-6">
                Berdasarkan hasil penilaian, pekerjaan berikut sangat sesuai dengan profil Anda:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.recommendedJobs.map((job, index) => (
                  <div
                    key={index}
                    className="flex items-start p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-slate-400 transition"
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="ml-4 text-slate-900 font-medium">{job}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg transition"
            >
              Lanjut ke Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
