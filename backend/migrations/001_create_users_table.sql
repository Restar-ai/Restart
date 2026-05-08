-- Create users table untuk auth
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
);

-- Index untuk search lebih cepat
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_nik ON users(nik);
CREATE INDEX idx_role ON users(role);
