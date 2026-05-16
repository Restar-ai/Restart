import { getConnection } from "../services/db.js"

// Assessment questions data
const ASSESSMENT_QUESTIONS = [
  { id: 1, category: "physical", question: "Saya mampu melakukan pekerjaan fisik yang menguras tenaga (seperti berdiri lama atau mengangkat barang) berjam-jam tanpa cepat lelah." },
  { id: 2, category: "physical", question: "Saya kuat mengangkat, mendorong, atau menarik beban yang berat secara berulang-ulang." },
  { id: 3, category: "physical", question: "Tangan saya sangat cekatan dan terampil saat merakit, menyusun, atau memperbaiki benda-benda." },
  { id: 4, category: "physical", question: "Saya sangat mudah menghafal jalan, tidak mudah nyasar, dan tahu arah meskipun berada di tempat baru." },
  { id: 5, category: "communication", question: "Saya sabar mendengarkan orang lain berbicara sampai selesai tanpa memotong, dan mudah memahami maksud mereka." },
  { id: 6, category: "communication", question: "Saya bisa berbicara dengan jelas, percaya diri, dan mudah dipahami oleh orang yang baru saya kenal." },
  { id: 7, category: "communication", question: "Saya senang membantu orang lain dan selalu berusaha membuat pelanggan merasa puas dan dihargai." },
  { id: 8, category: "communication", question: "Saya lebih suka bekerja bersama-sama dalam sebuah tim dan mudah menyesuaikan diri dengan cara kerja orang lain." },
  { id: 9, category: "problem_solving", question: "Jika ada mesin, kendaraan, atau alat yang tiba-tiba rusak, saya suka mencari tahu apa penyebabnya." },
  { id: 10, category: "problem_solving", question: "Saya selalu berusaha datang tepat waktu dan bisa menyelesaikan target kerja sebelum batas waktunya habis." },
  { id: 11, category: "personality", question: "Saya lebih suka pekerjaan yang menggunakan tangan, mesin, atau bekerja di luar ruangan daripada duduk di belakang meja." },
  { id: 12, category: "personality", question: "Saya suka membuat desain, memikirkan ide-ide kreatif, atau melakukan pekerjaan yang tidak terlalu terikat aturan baku." },
  { id: 13, category: "personality", question: "Saya sangat menyukai pekerjaan yang teratur, berulang-ulang, dan memiliki aturan yang jelas (seperti menyusun barang atau memasukkan data)." },
  { id: 14, category: "personality", question: "Saya merasa sangat puas jika pekerjaan saya bisa mengajari, menyembuhkan, atau berdampak langsung pada hidup orang lain." },
  { id: 15, category: "personality", question: "Saya berani mengambil risiko, suka memulai proyek baru, dan tidak malu untuk memimpin kelompok." }
]

const JOB_RECOMMENDATIONS = {
  physical_high_communication_high: ["Supervisor Lapangan", "Koordinator Logistik", "Pekerja Konstruksi"],
  physical_high_communication_low: ["Tukang Bangunan", "Pekerja Pabrik", "Teknisi Mesin"],
  communication_high_physical_low: ["Customer Service", "Sales Representative", "Staf Hotel/Restoran"],
  problem_solving_high: ["Teknisi Komputer", "Mekanik Otomotif", "Tukang Kayu/Pertukangan"],
  personality_creative: ["Desainer Grafis", "Pengrajin", "Content Creator"],
  personality_social: ["Guru", "Konselor", "Fasilitator Pelatihan"],
  personality_conventional: ["Data Entry", "Administrasi", "Penyusun Inventori"],
  personality_enterprising: ["Supervisor", "Manajer Toko", "Pengusaha Kecil"]
}

export const getAssessmentQuestions = (req, res) => {
  try {
    res.json({
      message: "Assessment questions",
      questions: ASSESSMENT_QUESTIONS
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const submitAssessment = (req, res) => {
  try {
    const { answers } = req.body
    const userId = req.user?.id || req.body.user_id

    if (!userId) {
      return res.status(400).json({ message: "User ID required" })
    }

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ message: "No answers provided" })
    }

    const db = getConnection()
    let answersInserted = 0
    const totalAnswers = Object.keys(answers).length

    Object.entries(answers).forEach(([questionId, answer]) => {
      const query = "INSERT INTO assessment_answers (user_id, question_id, answer) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE answer = ?"
      db.query(query, [userId, questionId, answer, answer], (err) => {
        if (err) console.error("Error saving answer:", err.message)
        answersInserted++
        if (answersInserted === totalAnswers) {
          calculateAndSaveResults(userId, res)
        }
      })
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

function calculateAndSaveResults(userId, res) {
  const db = getConnection()

  db.query("SELECT * FROM assessment_answers WHERE user_id = ?", [userId], (err, answers) => {
    if (err) {
      return res.status(500).json({ message: "Error calculating results" })
    }

    const scores = {
      physical: [],
      communication: [],
      problem_solving: [],
      personality: []
    }

    answers.forEach((answer) => {
      const questionId = answer.question_id
      const scoreValue = answer.answer

      if (questionId >= 1 && questionId <= 4) {
        scores.physical.push(scoreValue)
      } else if (questionId >= 5 && questionId <= 8) {
        scores.communication.push(scoreValue)
      } else if (questionId >= 9 && questionId <= 10) {
        scores.problem_solving.push(scoreValue)
      } else if (questionId >= 11 && questionId <= 15) {
        scores.personality.push(scoreValue)
      }
    })

    const calculateAvg = (arr) =>
      arr.length > 0 ? parseFloat((arr.reduce((a, b) => a + b) / arr.length).toFixed(2)) : 0

    const physicalScore = calculateAvg(scores.physical)
    const communicationScore = calculateAvg(scores.communication)
    const problemSolvingScore = calculateAvg(scores.problem_solving)
    const personalityScore = calculateAvg(scores.personality)

    const recommendedJobs = generateJobRecommendations(
      physicalScore,
      communicationScore,
      problemSolvingScore,
      personalityScore
    )

    const insertQuery = `
      INSERT INTO assessment_results 
      (user_id, physical_score, communication_score, problem_solving_score, personality_score, recommended_jobs)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      physical_score = ?, communication_score = ?, problem_solving_score = ?, personality_score = ?, recommended_jobs = ?
    `

    const jobsJson = JSON.stringify(recommendedJobs)

    db.query(
      insertQuery,
      [userId, physicalScore, communicationScore, problemSolvingScore, personalityScore, jobsJson, physicalScore, communicationScore, problemSolvingScore, personalityScore, jobsJson],
      (err) => {
        if (err) {
          console.error("Error saving assessment results:", err.message)
          return res.status(500).json({ message: "Error saving results" })
        }

        db.query("UPDATE users SET assessment_completed = 1 WHERE id = ?", [userId], (err) => {
          if (err) {
            console.error("Error updating user flag - SQL Error:", err);
            return res.status(500).json({ 
              message: "Error updating assessment flag",
              error: err.message 
            })
          }

          res.json({
            message: "Assessment completed successfully",
            results: {
              physicalScore,
              communicationScore,
              problemSolvingScore,
              personalityScore,
              recommendedJobs
            }
          })
        })
      }
    )
  })
}

function generateJobRecommendations(physicalScore, communicationScore, problemSolvingScore, personalityScore) {
  const recommended = []
  const threshold = 3.5

  if (physicalScore >= threshold && communicationScore >= threshold) {
    recommended.push(...JOB_RECOMMENDATIONS.physical_high_communication_high)
  } else if (physicalScore >= threshold) {
    recommended.push(...JOB_RECOMMENDATIONS.physical_high_communication_low)
  } else if (communicationScore >= threshold) {
    recommended.push(...JOB_RECOMMENDATIONS.communication_high_physical_low)
  }

  if (problemSolvingScore >= threshold) {
    recommended.push(...JOB_RECOMMENDATIONS.problem_solving_high)
  }

  if (personalityScore >= threshold) {
    const personalityRecommendations = [
      ...JOB_RECOMMENDATIONS.personality_creative,
      ...JOB_RECOMMENDATIONS.personality_social,
      ...JOB_RECOMMENDATIONS.personality_conventional,
      ...JOB_RECOMMENDATIONS.personality_enterprising
    ]
    recommended.push(...personalityRecommendations)
  }

  return [...new Set(recommended)].slice(0, 8)
}

export const getAssessmentResult = (req, res) => {
  try {
    const userId = req.user?.id || req.body.user_id

    if (!userId) {
      return res.status(400).json({ message: "User ID required" })
    }

    const db = getConnection()

    db.query("SELECT * FROM assessment_results WHERE user_id = ?", [userId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching assessment result" })
      }

      if (!result || result.length === 0) {
        return res.status(404).json({ message: "Assessment result not found" })
      }

      const data = result[0]
      res.json({
        message: "Assessment result",
        result: {
          physicalScore: data.physical_score,
          communicationScore: data.communication_score,
          problemSolvingScore: data.problem_solving_score,
          personalityScore: data.personality_score,
          recommendedJobs: JSON.parse(data.recommended_jobs),
          completedAt: data.completed_at
        }
      })
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
