const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "llama-3.3-70b-versatile"

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

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return res.status(503).json({ message: "Chat AI belum dikonfigurasi" })
    }

    // Build system prompt with user context
    let systemPrompt = SYSTEM_PROMPT

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

      if (lines.length > 0)
        systemPrompt += `\n\nData pengguna dari aplikasi:\n${lines.join("\n")}`
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error("Groq API error:", err)
      return res.status(502).json({ message: "Gagal menghubungi AI" })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || "Maaf, saya tidak bisa menjawab saat ini."

    res.json({ reply })
  } catch (error) {
    console.error("Chat error:", error.message)
    res.status(500).json({ message: "Terjadi kesalahan pada chat AI" })
  }
}
