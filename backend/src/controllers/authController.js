import { getConnection } from "../services/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
      address,
    } = req.body;

    // Validasi field required
    if (
      !name ||
      !email ||
      !password ||
      !password_confirm ||
      !nik ||
      !gender ||
      !birth_date ||
      !address
    ) {
      return res.status(400).json({
        message: "Semua field harus diisi",
      });
    }

    // Role otomatis participant untuk register
    const role = "participant";

    // Validasi password dan confirm password
    if (password !== password_confirm) {
      return res.status(400).json({
        message: "Password dan konfirmasi password tidak cocok",
      });
    }

    // Validasi panjang password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password minimal 6 karakter",
      });
    }

    getConnection().query(
      "SELECT * FROM users WHERE email = ? OR nik = ?",
      [email, nik],

      async (err, result) => {
        if (result && result.length > 0) {
          return res.status(400).json({
            message: "Email atau NIK sudah digunakan",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        getConnection().query(
          `INSERT INTO users
          (name, email, password, nik, gender, birth_date, address, role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

          [name, email, hashedPassword, nik, gender, birth_date, address, role],

          (err, result) => {
            if (err) {
              return res.status(500).json({
                message: err.message,
              });
            }

            res.status(201).json({
              message: "Register berhasil",
              user: {
                id: result.insertId,
                name,
                email,
                nik,
                gender,
                birth_date,
                address,
                role,
              },
            });
          },
        );
      },
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi field required
    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password harus diisi",
      });
    }

    getConnection().query(
      "SELECT * FROM users WHERE email = ?",
      [email],

      async (err, result) => {
        if (result && result.length === 0) {
          return res.status(400).json({
            message: "User tidak ditemukan",
          });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({
            message: "Password salah",
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },

          process.env.JWT_SECRET || "SECRET_KEY",

          {
            expiresIn: "1d",
          },
        );

        res.json({
          message: "Login berhasil",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            nik: user.nik,
            gender: user.gender,
            birth_date: user.birth_date,
            address: user.address,
            phone: user.phone,
            education: user.education,
            photo: user.photo,
            role: user.role,
            assessment_completed: user.assessment_completed || false,
          },
        });
      },
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { address, user_id } = req.body;

    if (!address || !user_id) {
      return res.status(400).json({
        message: "Alamat dan user_id harus diisi",
      });
    }

    getConnection().query(
      "UPDATE users SET address = ? WHERE id = ?",
      [address, user_id],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Gagal update alamat",
          });
        }

        res.json({
          message: "Alamat berhasil diperbarui",
          address,
        });
      },
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { user_id, phone, education, address, password, photo } = req.body;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id harus diisi",
      });
    }

    let updateQuery = "UPDATE users SET ";
    let updateParams = [];
    const updates = [];

    if (phone !== undefined && phone !== null) {
      updates.push("phone = ?");
      updateParams.push(phone);
    }

    if (education !== undefined && education !== null) {
      updates.push("education = ?");
      updateParams.push(education);
    }

    if (address !== undefined && address !== null) {
      updates.push("address = ?");
      updateParams.push(address);
    }

    if (photo !== undefined && photo !== null) {
      updates.push("photo = ?");
      updateParams.push(photo);
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password minimal 6 karakter",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      updateParams.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: "Tidak ada data yang diupdate",
      });
    }

    updateQuery += updates.join(", ") + " WHERE id = ?";
    updateParams.push(user_id);

    getConnection().query(updateQuery, updateParams, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal update profil",
          error: err.message,
        });
      }

      // Return updated user data
      getConnection().query(
        "SELECT id, name, email, nik, gender, birth_date, address, phone, education, photo, role, assessment_completed FROM users WHERE id = ?",
        [user_id],
        (err, users) => {
          if (err || !users || users.length === 0) {
            return res.status(500).json({
              message: "Gagal mengambil data profil",
            });
          }

          res.json({
            message: "Profil berhasil diperbarui",
            user: {
              id: users[0].id,
              name: users[0].name,
              email: users[0].email,
              nik: users[0].nik,
              gender: users[0].gender,
              birth_date: users[0].birth_date,
              address: users[0].address,
              phone: users[0].phone,
              education: users[0].education,
              photo: users[0].photo,
              role: users[0].role,
              assessment_completed: users[0].assessment_completed,
            },
          });
        },
      );
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id harus diisi",
      });
    }

    getConnection().query(
      "SELECT id, name, email, nik, gender, birth_date, address, phone, education, photo, role, assessment_completed FROM users WHERE id = ?",
      [user_id],
      (err, users) => {
        if (err) {
          return res.status(500).json({
            message: "Gagal mengambil data profil",
            error: err.message,
          });
        }

        if (!users || users.length === 0) {
          return res.status(404).json({
            message: "User tidak ditemukan",
          });
        }

        res.json({
          message: "Data profil berhasil diambil",
          user: {
            id: users[0].id,
            name: users[0].name,
            email: users[0].email,
            nik: users[0].nik,
            gender: users[0].gender,
            birth_date: users[0].birth_date,
            address: users[0].address,
            phone: users[0].phone,
            education: users[0].education,
            photo: users[0].photo,
            role: users[0].role,
            assessment_completed: users[0].assessment_completed,
          },
        });
      },
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id harus diisi",
      });
    }

    // Log logout activity (optional - untuk audit trail)
    res.status(200).json({
      message: "Logout berhasil",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { register, login, updateAddress, updateProfile, getProfile, logout };
