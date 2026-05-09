import mysql from "mysql2";

// Variabel connection global
let db = null;

// Mengambil koneksi MySQL
const getConnection = () => {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }
  return db;
};

// Inisialisasi database + tabel
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    // Koneksi awal tanpa database dulu (untuk create database)
    const initialConnection = mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
    });

    // Buat database jika belum ada
    initialConnection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "restart_db"}`,
      (err) => {
        if (err) {
          console.error("Error creating database:", err.message);
          reject(err);
          return;
        }

        console.log(
          `✓ Database ${process.env.DB_NAME || "restart_db"} sudah ada/dibuat`,
        );

        // Koneksi ke database yang baru dibuat
        db = mysql.createConnection({
          host: process.env.DB_HOST || "localhost",
          port: process.env.DB_PORT || 3306,
          user: process.env.DB_USER || "root",
          password: process.env.DB_PASS || "",
          database: process.env.DB_NAME || "restart_db",
        });

        db.connect((err) => {
          if (err) {
            console.error("Error connecting to database:", err.message);
            reject(err);
            return;
          }

          console.log(
            `✓ MySQL Connected to ${process.env.DB_NAME || "restart_db"}`,
          );

          // Buat tabel users
          const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              nik VARCHAR(20) UNIQUE NOT NULL,
              gender ENUM('male', 'female', 'other') NOT NULL,
              birth_date DATE NOT NULL,
              address TEXT NOT NULL,
              role ENUM('trainer','participant') NOT NULL DEFAULT 'participant',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
          `;

          db.query(createUsersTable, (err) => {
            if (err) {
              console.error("Error creating users table:", err.message);
              reject(err);
              return;
            }
            console.log("✓ Table users sudah ada/dibuat");

            // Buat tabel courses
            const createCoursesTable = `
              CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                instructor VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                image_url VARCHAR(500),
                duration_hours INT,
                difficulty_level VARCHAR(50),
                price DECIMAL(10,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              )
            `;

            db.query(createCoursesTable, (err) => {
              if (err) {
                console.error("Error creating courses table:", err.message);
                reject(err);
                return;
              }
              console.log("✓ Table courses sudah ada/dibuat");

              // Buat tabel user_courses
              const createUserCoursesTable = `
                CREATE TABLE IF NOT EXISTS user_courses (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id INT NOT NULL,
                  course_id INT NOT NULL,
                  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  progress_percentage INT DEFAULT 0,
                  completed_at TIMESTAMP NULL,
                  FOREIGN KEY (user_id) REFERENCES users(id),
                  FOREIGN KEY (course_id) REFERENCES courses(id),
                  UNIQUE KEY unique_user_course(user_id, course_id)
                )
              `;

              db.query(createUserCoursesTable, (err) => {
                if (err) {
                  console.error(
                    "Error creating user_courses table:",
                    err.message,
                  );
                  reject(err);
                  return;
                }
                console.log("✓ Table user_courses sudah ada/dibuat");
                initialConnection.end();
                resolve(db);
              });
            });
          });
        });
      },
    );
  });
};

// **Export**: named export supaya bisa import { getConnection, initializeDatabase }
export { getConnection, initializeDatabase };
