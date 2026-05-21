import { getConnection } from "../services/db.js";

export const seedEnrollments = () => {
  const db = getConnection();

  // Check if enrollments sudah ada
  db.query("SELECT COUNT(*) as count FROM user_courses", (err, results) => {
    if (err) {
      console.error("Error checking enrollments:", err.message);
      return;
    }

    if (results[0].count > 0) {
      console.log("✓ Enrollments sudah ada, skip seeding");
      return;
    }

    // Get all participants dan courses
    db.query(
      "SELECT id FROM users WHERE role = 'participant'",
      (err, participants) => {
        if (err) {
          console.error("Error fetching participants:", err.message);
          return;
        }

        db.query("SELECT id FROM courses LIMIT 5", (err, courses) => {
          if (err) {
            console.error("Error fetching courses:", err.message);
            return;
          }

          let inserted = 0;
          const enrollments = [];

          // Buat enrollments:
          // Participant ID 4 (Test User) - belum mulai
          // Participant ID 5 (Dashboard Tester) - 1 course dalam proses (progress 0%)
          // Participant ID 6 (Hendra) - 2 courses dalam proses
          // Participant ID 7 (Sari) - 1 course selesai (100%)
          // Participant ID 8 (Eko) - 2 courses dalam proses

          if (courses.length > 0) {
            // Dashboard Tester - 1 course dalam proses
            enrollments.push({
              user_id: 5,
              course_id: courses[0].id,
              progress_percentage: 0,
              completed_at: null,
            });

            // Hendra - 2 courses dalam proses
            enrollments.push({
              user_id: 6,
              course_id: courses[0].id,
              progress_percentage: 50,
              completed_at: null,
            });
            enrollments.push({
              user_id: 6,
              course_id: courses[1].id,
              progress_percentage: 30,
              completed_at: null,
            });

            // Sari - 1 course selesai
            enrollments.push({
              user_id: 7,
              course_id: courses[0].id,
              progress_percentage: 100,
              completed_at: new Date().toISOString().split("T")[0],
            });

            // Eko - 2 courses dalam proses
            enrollments.push({
              user_id: 8,
              course_id: courses[1].id,
              progress_percentage: 45,
              completed_at: null,
            });
            enrollments.push({
              user_id: 8,
              course_id: courses[2].id,
              progress_percentage: 20,
              completed_at: null,
            });
          }

          enrollments.forEach((enrollment) => {
            db.query(
              `INSERT INTO user_courses (user_id, course_id, progress_percentage, completed_at)
             VALUES (?, ?, ?, ?)`,
              [
                enrollment.user_id,
                enrollment.course_id,
                enrollment.progress_percentage,
                enrollment.completed_at,
              ],
              (err) => {
                if (err) {
                  console.error("Error inserting enrollment:", err.message);
                  return;
                }
                inserted++;
                if (inserted === enrollments.length) {
                  console.log("✓ Enrollments seeded successfully");
                }
              },
            );
          });
        });
      },
    );
  });
};
