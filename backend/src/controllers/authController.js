import getDb from '../services/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      password_confirm,
      nik,
      gender,
      birth_date,
      address
    } = req.body

    // Validasi field required
    if (!name || !email || !password || !password_confirm || !nik || !gender || !birth_date || !address) {
      return res.status(400).json({
        message: 'Semua field harus diisi'
      })
    }

    // Role otomatis participant untuk register
    const role = 'participant'

    // Validasi password dan confirm password
    if (password !== password_confirm) {
      return res.status(400).json({
        message: 'Password dan konfirmasi password tidak cocok'
      })
    }

    // Validasi panjang password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password minimal 6 karakter'
      })
    }

    getDb().query(
      'SELECT * FROM users WHERE email = ? OR nik = ?',
      [email, nik],

      async (err, result) => {

        if (result && result.length > 0) {

          return res.status(400).json({
            message: 'Email atau NIK sudah digunakan'
          })
        }

        const hashedPassword =
          await bcrypt.hash(password, 10)

        getDb().query(
          `INSERT INTO users
          (name, email, password, nik, gender, birth_date, address, role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

          [
            name,
            email,
            hashedPassword,
            nik,
            gender,
            birth_date,
            address,
            role
          ],

          (err, result) => {

            if (err) {

              return res.status(500).json({
                message: err.message
              })
            }

            res.status(201).json({
              message: 'Register berhasil',
              user: {
                id: result.insertId,
                name,
                email,
                role
              }
            })
          }
        )
      }
    )

  } catch (error) {

    res.status(500).json({
      message: error.message
    })
  }
}

const login = async (req, res) => {

  try {

    const { email, password } = req.body

    // Validasi field required
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email dan password harus diisi'
      })
    }

    getDb().query(
      'SELECT * FROM users WHERE email = ?',
      [email],

      async (err, result) => {

        if (result && result.length === 0) {

          return res.status(400).json({
            message: 'User tidak ditemukan'
          })
        }

        const user = result[0]

        const isMatch =
          await bcrypt.compare(
            password,
            user.password
          )

        if (!isMatch) {

          return res.status(400).json({
            message: 'Password salah'
          })
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role
          },

          process.env.JWT_SECRET || 'SECRET_KEY',

          {
            expiresIn: '1d'
          }
        )

        res.json({
          message: 'Login berhasil',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        })
      }
    )

  } catch (error) {

    res.status(500).json({
      message: error.message
    })
  }
}

export { register, login }