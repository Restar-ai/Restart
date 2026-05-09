import { getConnection } from "../services/db.js";
import bcrypt from "bcryptjs";

const seedTrainers = async () => {
  try {
    const trainers = [
      {
        name: "Budi Santoso",
        email: "budi@pelatihan.com",
        password: "trainer123",
        nik: "1234567890123456",
        gender: "male",
        birth_date: "1985-05-15",
        address: "Jakarta Timur, Indonesia",
        role: "trainer",
      },
      {
        name: "Siti Nurhaliza",
        email: "siti@pelatihan.com",
        password: "trainer123",
        nik: "1234567890123457",
        gender: "female",
        birth_date: "1990-08-20",
        address: "Bandung, Indonesia",
        role: "trainer",
      },
      {
        name: "Ahmad Riswanto",
        email: "ahmad@pelatihan.com",
        password: "trainer123",
        nik: "1234567890123458",
        gender: "male",
        birth_date: "1988-03-10",
        address: "Surabaya, Indonesia",
        role: "trainer",
      },
    ];

    for (const trainer of trainers) {
      // Check if trainer email sudah ada
      getConnection().query(
        "SELECT * FROM users WHERE email = ?",
        [trainer.email],
        async (err, result) => {
          if (result && result.length === 0) {
            // Hash password
            const hashedPassword = await bcrypt.hash(trainer.password, 10);

            // Insert trainer
            getConnection().query(
              `INSERT INTO users (name, email, password, nik, gender, birth_date, address, role)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                trainer.name,
                trainer.email,
                hashedPassword,
                trainer.nik,
                trainer.gender,
                trainer.birth_date,
                trainer.address,
                trainer.role,
              ],
              (err, result) => {
                if (err) {
                  console.error(
                    `Error seeding trainer ${trainer.email}:`,
                    err.message,
                  );
                } else {
                  console.log(
                    `✓ Trainer ${trainer.name} (${trainer.email}) berhasil ditambahkan`,
                  );
                }
              },
            );
          } else {
            console.log(`• Trainer ${trainer.email} sudah ada, skip`);
          }
        },
      );
    }

    console.log("Seeder trainers selesai");
  } catch (error) {
    console.error("Error saat seed trainers:", error.message);
  }
};

export default seedTrainers;
