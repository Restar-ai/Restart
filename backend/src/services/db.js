import mysql from 'mysql2'

let db = null

const getConnection = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.')
  }
  return db
}

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    // Connection tanpa database dulu untuk create database
    const initialConnection = mysql.createConnection({
      host: process.env.DB_URL || 'localhost',
      port: process.env.DB_PORT || 3307,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    })

    // Create database
    initialConnection.query('CREATE DATABASE IF NOT EXISTS restart_db', (err) => {
      if (err) {
        console.error('Error creating database:', err.message)
        reject(err)
        return
      }

      console.log('✓ Database restart_db sudah ada/dibuat')

      // Sekarang connect ke database
      db = mysql.createConnection({
        host: process.env.DB_URL || 'localhost',
        port: process.env.DB_PORT || 3307,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'restart_db'
      })

      db.connect((err) => {
        if (err) {
          console.log('Error connecting to database:', err.message)
          reject(err)
          return
        }

        console.log('✓ MySQL Connected to restart_db')

        // Create users table
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            nik VARCHAR(20) UNIQUE NOT NULL,
            gender ENUM('male', 'female', 'other') NOT NULL,
            birth_date DATE NOT NULL,
            address TEXT NOT NULL,
            role ENUM('trainer', 'participant') NOT NULL DEFAULT 'participant',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `

        db.query(createTableQuery, (err) => {
          if (err) {
            console.error('Error creating table:', err.message)
            reject(err)
            return
          }

          console.log('✓ Table users sudah ada/dibuat')
          initialConnection.end()
          resolve(db)
        })
      })
    })
  })
}

export default getConnection
export { initializeDatabase }