# RESTART Career Platform

RESTART is a web-based platform that helps former inmates rebuild their career pathway through structured learning, career assessment powered by a machine learning model, and an AI chat assistant for career guidance.

This repository contains three separate services:

- `frontend/` — React + Vite web client (port 5173)
- `backend/` — Express REST API server (port 5000)
- `ai-service/` — FastAPI ML prediction + RAG service (port 8000)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express, mysql2, bcryptjs, jsonwebtoken |
| Database | MySQL (`restart_db`) |
| AI Service | Python, FastAPI, TensorFlow / Keras |
| Chat AI | Google Gemini Flash (via API) |
| RAG | ChromaDB, sentence-transformers |

## Repository Structure

```
restart-career-platform/
├── backend/          # Express API application
├── frontend/         # React + Vite application
├── ai-service/       # FastAPI ML prediction + RAG service
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
cp backend/.env.example backend/.env
```

Fill in the values in `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=restart_db
JWT_SECRET=your_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free Gemini API key at [https://aistudio.google.com](https://aistudio.google.com).

### 3. Set up the database

Run migrations in order:

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

On first startup, the service loads the embedding model from `ai-service/models/` (local) and indexes the career knowledge base into ChromaDB.

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

## Request Flows

### Assessment (ML-based career recommendation)

```
React page
  → POST /api/assessment/submit
  → assessmentController.js
  → POST http://localhost:8000/predict   (AI service)
  → Keras DNN → top-3 professions + confidence scores
  → save to MySQL
  → AssessmentResultPage.jsx
```

If the AI service is unreachable, the backend falls back to rule-based recommendations automatically.

### Chat AI (career guidance)

```
DashboardPage.jsx
  → POST /api/chat  { message, context }
  → chatController.js
  → POST http://localhost:8000/retrieve  (RAG context lookup)
  → Gemini Flash API  (system prompt + RAG docs + user context)
  → reply text → chat window
```

User context passed to Gemini includes: assessment result, top professions, skill scores, enrolled courses, and learning progress.
