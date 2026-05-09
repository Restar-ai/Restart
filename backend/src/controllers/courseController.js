import { getConnection } from "../services/db.js";

export const getAllCourses = (req, res) => {
  try {
    const db = getConnection();
    db.query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM user_courses WHERE course_id = c.id) as enrolled_count
       FROM courses c
       ORDER BY c.created_at DESC`,
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results || []);
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCourseById = (req, res) => {
  try {
    const { id } = req.params;
    const db = getConnection();
    db.query(`SELECT * FROM courses WHERE id = ?`, [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results.length)
        return res.status(404).json({ error: "Course not found" });
      res.json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserCourses = (req, res) => {
  try {
    const { userId } = req.params;
    const db = getConnection();
    db.query(
      `SELECT c.*, uc.progress_percentage, uc.enrollment_date, uc.completed_at
       FROM courses c
       JOIN user_courses uc ON c.id = uc.course_id
       WHERE uc.user_id = ?
       ORDER BY uc.enrollment_date DESC`,
      [userId],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results || []);
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const enrollCourse = (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const db = getConnection();

    db.query(
      `SELECT id FROM user_courses WHERE user_id = ? AND course_id = ?`,
      [userId, courseId],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
          return res
            .status(400)
            .json({ error: "Already enrolled in this course" });
        }

        db.query(
          `INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)`,
          [userId, courseId],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
              success: true,
              message: "Successfully enrolled in course",
            });
          },
        );
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCourseProgress = (req, res) => {
  try {
    const { userId, courseId, progressPercentage } = req.body;
    const db = getConnection();

    db.query(
      `UPDATE user_courses SET progress_percentage = ? WHERE user_id = ? AND course_id = ?`,
      [progressPercentage, userId, courseId],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        if (progressPercentage === 100) {
          db.query(
            `UPDATE user_courses SET completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?`,
            [userId, courseId],
            (err) => {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ success: true, message: "Progress updated" });
            },
          );
        } else {
          res.json({ success: true, message: "Progress updated" });
        }
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardStats = (req, res) => {
  try {
    const { userId } = req.params;
    const db = getConnection();

    db.query(
      `SELECT 
        (SELECT COUNT(*) FROM user_courses WHERE user_id = ?) as total_enrolled,
        (SELECT COUNT(*) FROM user_courses WHERE user_id = ? AND completed_at IS NOT NULL) as completed_courses,
        (SELECT COALESCE(AVG(progress_percentage), 0) FROM user_courses WHERE user_id = ?) as avg_progress`,
      [userId, userId, userId],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
