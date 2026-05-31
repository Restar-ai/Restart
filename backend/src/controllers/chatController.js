const GEMINI_MODEL = "gemini-flash-latest"
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000"

const SYSTEM_PROMPT = `Kamu adalah AI Career Assistant untuk platform RESTART — platform karier untuk mantan narapidana di Indonesia yang membantu mereka memulai kembali kehidupan melalui pelatihan dan pengembangan karier.

Platform RESTART menyediakan rekomendasi profesi berbasis AI dari 12 pilihan:
Admin Data, Admin Media Sosial, Barista, Customer Service, Desainer Grafis, Digital Marketer, Fotografer, Host Live Streamer, Kasir, Pramusaji, Video Editor, Web Developer.

Peranmu:
- Bantu pengguna memahami profesi yang direkomendasikan untuk mereka
- Berikan saran skill yang perlu dipelajari
- Berikan motivasi dan dukungan
- Jawab pertanyaan seputar karier dan pengembangan diri
- Gunakan bahasa Indonesia yang ramah dan mudah dipahami
- Jawaban singkat dan fokus, maksimal 3-4 kalimat kecuali diminta detail`

export const chat = async (req, res) => {
  try {
    const { message, context } = req.body

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Pesan tidak boleh kosong" })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(503).json({ message: "Chat AI belum dikonfigurasi" })
    }

    // Retrieve relevant knowledge from RAG
    let ragContext = ""
    try {
      const ragRes = await fetch(`${AI_SERVICE_URL}/retrieve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: message, n_results: 4 }),
        signal: AbortSignal.timeout(5000)
      })
      if (ragRes.ok) {
        const ragData = await ragRes.json()
        if (ragData.documents?.length > 0) {
          ragContext = "\n\nInformasi relevan dari knowledge base RESTART:\n" +
            ragData.documents.map((d, i) => `[${i + 1}] ${d}`).join("\n")
        }
      }
    } catch {
      // RAG tidak tersedia, lanjut tanpa konteks tambahan
    }

    // Build system prompt
    let systemPrompt = SYSTEM_PROMPT + ragContext

    if (context) {
      const lines = []

      if (context.userName)
        lines.push(`Nama pengguna: ${context.userName}. Sapa dengan namanya jika relevan.`)

      if (context.topProfession)
        lines.push(`Profesi paling cocok: "${context.topProfession}" (${Math.round((context.confidence || 0) * 100)}% kesesuaian).`)

      if (context.allProfessions?.length > 1)
        lines.push(`Top-3 profesi rekomendasi: ${context.allProfessions.join(", ")}.`)

      if (context.physicalScore)
        lines.push(`Skor assessment — Fisik: ${context.physicalScore}, Komunikasi: ${context.communicationScore}, Problem Solving: ${context.problemSolvingScore}, Kepribadian: ${context.personalityScore} (skala 1–5).`)

      if (context.enrolledCourses?.length > 0) {
        const courseList = context.enrolledCourses.map(c =>
          `"${c.title}" (${c.category}, progress ${c.progress}%${c.completed ? ', selesai' : ''})`
        ).join("; ")
        lines.push(`Kursus yang sedang diikuti: ${courseList}.`)
      } else {
        lines.push(`Pengguna belum mengikuti kursus apapun.`)
      }

      if (context.stats)
        lines.push(`Statistik belajar — Total kursus diikuti: ${context.stats.totalEnrolled}, selesai: ${context.stats.completed}, rata-rata progress: ${context.stats.avgProgress}%.`)

      if (context.availableCoursesCount > 0)
        lines.push(`Tersedia ${context.availableCoursesCount} kursus lain yang belum diikuti di platform.`)

      if (!context.hasAssessment)
        lines.push(`Pengguna belum mengerjakan asesmen karier.`)

      if (context.appPages) {
        const pageList = Object.values(context.appPages)
          .map(p => `"${p.label}" → ${p.path}`)
          .join(", ")
        lines.push(`Halaman aplikasi yang tersedia: ${pageList}. Jika pengguna bertanya cara mengakses fitur tertentu, sebutkan nama halamannya dan pathnya.`)
      }

      if (lines.length > 0)
        systemPrompt += `\n\nData pengguna dari aplikasi:\n${lines.join("\n")}`
    }

    // Build conversation history for multi-turn context
    const history = Array.isArray(req.body.history) ? req.body.history : []
    const contents = [
      ...history.map(m => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      })),
      { role: "user", parts: [{ text: message }] }
    ]

    // Gemini API call
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 1500, temperature: 0.7 }
      }),
      signal: AbortSignal.timeout(20000)
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error("Gemini API error:", err)
      return res.status(502).json({ message: "Gagal menghubungi AI" })
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak bisa menjawab saat ini."

    res.json({ reply })
  } catch (error) {
    console.error("Chat error:", error.message)
    res.status(500).json({ message: "Terjadi kesalahan pada chat AI" })
  }
}
