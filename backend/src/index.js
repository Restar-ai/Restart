import "dotenv/config.js";
import app from "./app.js";
import { initializeDatabase } from "./services/db.js";
import seedTrainers from "./seeders/trainerSeeder.js";
import { seedCourses } from "./seeders/courseSeeder.js";

const PORT = process.env.PORT || 5000;

// Initialize database dulu, baru start server
initializeDatabase()
  .then(() => {
    // Seed trainers
    seedTrainers();

    // Seed courses
    setTimeout(() => {
      seedCourses();
    }, 500);

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error.message);
    process.exit(1);
  });
