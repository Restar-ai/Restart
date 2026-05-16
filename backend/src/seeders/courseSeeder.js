import { getConnection } from "../services/db.js";

export const seedCourses = () => {
  const db = getConnection();

  // Check if courses sudah ada
  db.query("SELECT COUNT(*) as count FROM courses", (err, results) => {
    if (err) {
      console.error("Error checking courses:", err.message);
      return;
    }

    if (results[0].count > 0) {
      console.log("✓ Courses sudah ada, skip seeding");
      return;
    }

    const courses = [
      {
        title: "Web Development dengan React",
        description:
          "Pelajari cara membuat aplikasi web modern menggunakan React",
        instructor: "Budi Santoso",
        category: "Web Development",
        image_url:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
        duration_hours: 40,
        difficulty_level: "Intermediate",
        price: 299999,
      },
      {
        title: "Python untuk Data Science",
        description: "Master Python untuk analisis data dan machine learning",
        instructor: "Dr. Rina Wijaya",
        category: "Data Science",
        image_url:
          "https://images.unsplash.com/photo-1649180556628-9ba704115795?w=400&h=250&fit=crop",
        duration_hours: 50,
        difficulty_level: "Intermediate",
        price: 349999,
      },
      {
        title: "UI/UX Design Fundamentals",
        description: "Pelajari prinsip desain dan user experience",
        instructor: "Maya Kusuma",
        category: "Design",
        image_url:
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
        duration_hours: 30,
        difficulty_level: "Beginner",
        price: 249999,
      },
      {
        title: "JavaScript Advanced Concepts",
        description: "Kuasai konsep advanced JavaScript",
        instructor: "Ahmad Reza",
        category: "Web Development",
        image_url:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop",
        duration_hours: 35,
        difficulty_level: "Advanced",
        price: 299999,
      },
      {
        title: "Mobile App Development React Native",
        description: "Buat aplikasi mobile dengan React Native",
        instructor: "Hendra Wijaya",
        category: "Mobile Development",
        image_url:
          "https://images.unsplash.com/photo-1670057037226-b3d65909424f?w=400&h=250&fit=crop",
        duration_hours: 45,
        difficulty_level: "Intermediate",
        price: 349999,
      },
      {
        title: "DevOps & Cloud Deployment",
        description: "Docker, Kubernetes, dan cloud deployment",
        instructor: "Yuki Tanaka",
        category: "DevOps",
        image_url:
          "https://images.unsplash.com/photo-1690627931320-16ac56eb2588?w=400&h=250&fit=crop",
        duration_hours: 40,
        difficulty_level: "Advanced",
        price: 399999,
      },
      {
        title: "SQL Database Management",
        description: "Kuasai SQL dan database design",
        instructor: "Siti Nurhaliza",
        category: "Backend",
        image_url:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
        duration_hours: 35,
        difficulty_level: "Intermediate",
        price: 279999,
      },
      {
        title: "Digital Marketing Essentials",
        description: "Strategi marketing digital dan social media",
        instructor: "Eka Prasetya",
        category: "Business",
        image_url:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
        duration_hours: 25,
        difficulty_level: "Beginner",
        price: 199999,
      },
    ];

    let inserted = 0;
    courses.forEach((course) => {
      db.query(
        `INSERT INTO courses (title, description, instructor, category, image_url, duration_hours, difficulty_level, price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          course.title,
          course.description,
          course.instructor,
          course.category,
          course.image_url,
          course.duration_hours,
          course.difficulty_level,
          course.price,
        ],
        (err) => {
          if (err) {
            console.error("Error inserting course:", err.message);
            return;
          }
          inserted++;
          if (inserted === courses.length) {
            console.log("✓ Courses seeded successfully");
          }
        },
      );
    });
  });
};
