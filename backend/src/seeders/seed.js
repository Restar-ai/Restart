// Script untuk seed data awal ke database
// Run: node src/seeders/seed.js

require('dotenv').config()
const seedTrainers = require('./trainerSeeder')

console.log('🌱 Starting database seeding...\n')

// Seed trainers
seedTrainers()

// Close connection setelah seeding
setTimeout(() => {
  console.log('\n✓ Seeding complete!')
  process.exit(0)
}, 2000)
