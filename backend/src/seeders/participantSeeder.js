import getDb from '../services/db.js'
import bcrypt from 'bcryptjs'

// Promisify query untuk handle async/await
const queryAsync = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    getDb().query(sql, values, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

const seedParticipants = async () => {
  try {
    const participants = [
      {
        name: 'Hendra Wijaya',
        email: 'hendra@email.com',
        password: 'participant123',
        nik: '1234567890123459',
        gender: 'male',
        birth_date: '1990-07-22',
        address: 'Medan, Indonesia',
        role: 'participant'
      },
      {
        name: 'Sari Kusuma',
        email: 'sari@email.com',
        password: 'participant123',
        nik: '1234567890123460',
        gender: 'female',
        birth_date: '1992-12-08',
        address: 'Yogyakarta, Indonesia',
        role: 'participant'
      },
      {
        name: 'Eko Prasetyo',
        email: 'eko@email.com',
        password: 'participant123',
        nik: '1234567890123461',
        gender: 'male',
        birth_date: '1988-04-11',
        address: 'Semarang, Indonesia',
        role: 'participant'
      },
      {
        name: 'Yuni Hartati',
        email: 'yuni@email.com',
        password: 'participant123',
        nik: '1234567890123462',
        gender: 'female',
        birth_date: '1991-09-30',
        address: 'Makassar, Indonesia',
        role: 'participant'
      }
    ]

    for (const participant of participants) {
      try {
        // Check if participant email sudah ada
        const result = await queryAsync(
          'SELECT * FROM users WHERE email = ?',
          [participant.email]
        )

        if (result && result.length === 0) {
          // Hash password
          const hashedPassword = await bcrypt.hash(participant.password, 10)

          // Insert participant
          await queryAsync(
            `INSERT INTO users (name, email, password, nik, gender, birth_date, address, role)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              participant.name,
              participant.email,
              hashedPassword,
              participant.nik,
              participant.gender,
              participant.birth_date,
              participant.address,
              participant.role
            ]
          )
          console.log(`✓ Participant ${participant.name} (${participant.email}) berhasil ditambahkan`)
        } else {
          console.log(`• Participant ${participant.email} sudah ada, skip`)
        }
      } catch (err) {
        console.error(`Error seeding participant ${participant.email}:`, err.message)
      }
    }

    console.log('✓ Seeder participants selesai')
  } catch (error) {
    console.error('Error saat seed participants:', error.message)
  }
}

export default seedParticipants
