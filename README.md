# RESTART Career Platform

RESTART is a web-based platform that helps former inmates rebuild their career pathway through structured learning, career assessment powered by a machine learning model, and job recommendations matched to their skills and personality.

This repository contains three separate services:

- `frontend/` — React + Vite web client (port 5173)
- `backend/` — Express REST API server (port 5000)
- `ai-service/` — FastAPI prediction service with a Keras DNN model (port 8000)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express, mysql2, bcryptjs, jsonwebtoken |
| Database | MySQL (`restart_db`) |
| AI Service | Python, FastAPI, TensorFlow / Keras |

## Repository Structure

```
restart-career-platform/
├── backend/          # Express API application
├── frontend/         # React + Vite application
├── ai-service/       # FastAPI ML prediction service
└── package.json      # Root scripts for running backend and frontend
```

For service-specific details, see:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## Getting Started

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET
```

### 3. Set up the database

Run migrations in order using your MySQL client:

```bash
mysql -u root restart_db < backend/migrations/001_create_users_table.sql
mysql -u root restart_db < backend/migrations/002_add_phone_education_to_users.sql
```

### 4. Start the AI service

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 5. Start backend and frontend

From the project root:

```bash
npm run backend:dev     # starts backend on port 5000
npm run frontend:dev    # starts frontend on port 5173
```

Or start both at once:

```bash
npm run start
```

## Available Root Scripts

```bash
npm run backend:dev
npm run backend:start
npm run frontend:dev
npm run frontend:build
npm run frontend:lint
npm run start           # runs backend + frontend concurrently
```

## Service Ports

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| AI Service | http://localhost:8000 |

## Request Flow (Assessment)

```
React page
  → assessmentApi.js
  → POST /api/assessment/submit
  → assessmentController.js
  → POST http://localhost:8000/predict  (AI service)
  → Keras DNN model → top-3 professions + confidence
  → save to MySQL assessment_results
  → JSON response → AssessmentResultPage.jsx
```

If the AI service is unreachable, the backend automatically falls back to a rule-based recommendation so the assessment never fails.
