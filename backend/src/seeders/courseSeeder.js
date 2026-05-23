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
        title: "Copywriting untuk Sales & Marketing",
        description:
          "Pelajari teknik menulis yang persuasif untuk meningkatkan konversi penjualan dan engagement audience",
        instructor: "Fera Wirawan",
        category: "Digital Marketing",
        image_url:
          "https://images.unsplash.com/photo-1667056624790-f0e8e391c086?w=400&h=250&fit=crop",
        duration_hours: 20,
        difficulty_level: "Beginner",
        price: 199999,
      },
      {
        title: "Digital Marketing Masterclass",
        description: "Strategi marketing digital lengkap: SEO, SEM, email marketing, dan analytics",
        instructor: "Rudi Hartono",
        category: "Digital Marketing",
        image_url:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
        duration_hours: 35,
        difficulty_level: "Intermediate",
        price: 299999,
      },
      {
        title: "Content Creator: Dari Konsep hingga Viral",
        description: "Buat konten menarik yang resonan dengan audience dan meningkatkan engagement",
        instructor: "Citra Dewi",
        category: "Content Creation",
        image_url:
          "https://images.unsplash.com/photo-1636971828014-0f3493cba88a?w=400&h=250&fit=crop",
        duration_hours: 30,
        difficulty_level: "Beginner",
        price: 249999,
      },
      {
        title: "Video Editing Professional",
        description: "Edit video seperti pro menggunakan Adobe Premiere dan DaVinci Resolve",
        instructor: "Andri Gunawan",
        category: "Video Production",
        image_url:
          "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=250&fit=crop",
        duration_hours: 40,
        difficulty_level: "Intermediate",
        price: 329999,
      },
      {
        title: "Photography: Teknik & Komposisi",
        description: "Kuasai teknik fotografi professional, pencahayaan, dan editing foto",
        instructor: "Wardi Sutrisno",
        category: "Photography",
        image_url:
          "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=400&h=250&fit=crop",
        duration_hours: 28,
        difficulty_level: "Beginner",
        price: 279999,
      },
      {
        title: "Social Media Management Expert",
        description: "Kelola social media bisnis: strategi konten, community management, dan growth hacking",
        instructor: "Dina Kartika",
        category: "Social Media",
        image_url:
          "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=250&fit=crop",
        duration_hours: 25,
        difficulty_level: "Beginner",
        price: 229999,
      },
      {
        title: "Administrative Assistant Skills",
        description: "Keterampilan administrasi: manajemen file, scheduling, komunikasi profesional",
        instructor: "Siti Juwita",
        category: "Business Administration",
        image_url:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
        duration_hours: 20,
        difficulty_level: "Beginner",
        price: 179999,
      },
      {
        title: "Graphic Design Fundamental",
        description: "Desain grafis dengan Canva, Adobe XD, dan Photoshop untuk pemula",
        instructor: "Toni Setiawan",
        category: "Design",
        image_url:
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
        duration_hours: 32,
        difficulty_level: "Beginner",
        price: 259999,
      },
      {
        title: "Affiliate Marketing: Strategi Profit",
        description: "Mulai bisnis affiliate, memilih produk, dan strategi marketing untuk passive income",
        instructor: "Bambang Suryanto",
        category: "Digital Marketing",
        image_url:
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop",
        duration_hours: 24,
        difficulty_level: "Beginner",
        price: 199999,
      },
      {
        title: "Live Streaming & Host Profesional",
        description: "Teknik live streaming, audience engagement, dan menjadi host yang menarik",
        instructor: "Maya Rosalind",
        category: "Content Creation",
        image_url:
          "https://images.unsplash.com/photo-1764162051349-7cc989a1399d?w=400&h=250&fit=crop",
        duration_hours: 22,
        difficulty_level: "Beginner",
        price: 219999,
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
