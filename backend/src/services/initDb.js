const mysql = require('mysql2')

// Connection tanpa database dulu untuk create database
const initialConnection = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: ''
})

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    // Create database
    initialConnection.query('CREATE DATABASE IF NOT EXISTS restart_db', (err) => {
      if (err) {
        console.error('Error creating database:', err.message)
        reject(err)
        return
      }

      console.log('✓ Database restart_db sudah ada/dibuat')

      // Sekarang connect ke database
      const db = mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '',
        database: 'restart_db'
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

module.exports = initializeDatabase
