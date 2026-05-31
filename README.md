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
| Chat AI | Google Gemini 2.5 Flash (via Gemini API) |
| RAG | ChromaDB, sentence-transformers |

## Repository Structure

```
restart-career-platform/
├── backend/          # Express API application
├── frontend/         # React + Vite application
├── ai-service/       # FastAPI ML prediction + RAG service
│   ├── model/            # Keras DNN model + artifacts (in git)
│   ├── models/           # Embedding model — downloaded separately (gitignored)
│   ├── knowledge/        # Career knowledge base for RAG (in git)
│   ├── main.py
│   ├── rag.py
│   ├── download_model.py # One-time embedding model downloader
│   └── requirements.txt
├── data-science/     # Data exploration, Notebooks, and Streamlit Dashboard
│   ├── dataset/      # Master_Data_RESTART.csv
│   ├── notebook/     # Capstone_Project_DS.ipynb
│   └── dashboard/    # Streamlit app files
└── package.json      # Root scripts for running backend and frontend
```

For service-specific details, see:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

---
## Data & Analytics

The analytics and raw data processing pipelines are located in the `data-science/` directory. The career recommendation model is trained on a specially curated dataset derived from the **O*NET (Occupational Information Network)** standards, tailored specifically for the SME and digital creative ecosystems in Indonesia.

- **Dataset:** `Master_Data_RESTART.csv` contains 16 essential features (10 cross-sectoral competencies and 6 Holland Code/RIASEC personality dimensions).
- **Dashboard:** Exploratory Data Analysis (EDA) visualizations can be accessed via our interactive Streamlit app.

### Running the Streamlit Dashboard Locally
```bash
cd data-science/dashboard
pip install -r requirements.txt
streamlit run app.py

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

Fill in `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=restart_db
JWT_SECRET=your_secret_here
AI_SERVICE_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Getting a Gemini API key (free)**
> Go to [https://aistudio.google.com](https://aistudio.google.com), sign in with a Google account, and click **Get API key**. The free tier is sufficient for development.

### 3. Set up the database

```bash
mysql -u root restart_db < backend/migrations/001_create_users_table.sql
mysql -u root restart_db < backend/migrations/002_add_phone_education_to_users.sql
```

### 4. Set up the AI service

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
```

#### 4a. Download the embedding model (one time only)

The Keras career model (`ai-service/model/`) is already included in this repository.

The RAG embedding model (`paraphrase-multilingual-MiniLM-L12-v2`, ~449 MB) is **not** included because of its size. Download it once using the provided script:

```bash
python download_model.py
```

The model is saved to `ai-service/models/` (gitignored) and will be loaded from there on every subsequent startup — no internet connection needed after the first download.

#### 4b. Start the AI service

```bash
uvicorn main:app --reload --port 8000
```

On startup you will see:

```
Knowledge base loaded: 72 chunks from 12 professions.
```

This confirms the RAG knowledge base is indexed and the service is ready.

### 5. Start backend and frontend

From the project root:

```bash
npm run start           # runs backend + frontend concurrently
```

Or separately:

```bash
npm run backend:dev     # port 5000
npm run frontend:dev    # port 5173
```

---

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

---

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
  → POST http://localhost:8000/retrieve  (RAG: find relevant career docs)
  → Gemini Flash API  (system prompt + RAG docs + user context)
  → reply text → chat window
```

User context sent with every message: assessment result, top professions, skill scores, enrolled courses, and learning progress.

---

## Models & Artifacts

| File | Location | In Git | Description |
|------|----------|--------|-------------|
| `profession_recommendation_model.keras` | `ai-service/model/` | Yes | Keras DNN career classifier |
| `feature_scaler.json` | `ai-service/model/` | Yes | Input normalization (mean/scale) |
| `feature_names.json` | `ai-service/model/` | Yes | Order of 16 input features |
| `profession_classes.json` | `ai-service/model/` | Yes | 12 output profession labels |
| `paraphrase-multilingual-MiniLM-L12-v2` | `ai-service/models/` | No | Sentence embedding model for RAG (449 MB) |

### 3. Data Dictionary

```markdown
## Data Dictionary

The `Master_Data_RESTART.csv` dataset consists of 2,400 rows and 17 columns. Below is the breakdown of the features used to train the recommendation system:

### Target Label (1 Column)
*   **Target_Profesi** (Categorical): The target profession (15 job classes in the SME, operational, and digital creative sectors).

### Cross-Sectoral Competency Features (10 Columns, Scale 1.0 - 5.0)
*   **Stamina:** The physical ability to exert oneself over long periods without getting winded or out of breath.
*   **Static Strength:** The ability to exert maximum muscle force to lift, push, pull, or carry objects.
*   **Manual Dexterity:** The ability to quickly move your hand, your hand together with your arm, or your two hands to grasp or assemble objects.
*   **Spatial Orientation:** The ability to know your location in relation to the environment or to know where other objects are in relation to you.
*   **Active Listening:** Giving full attention to what other people are saying, taking time to understand the points being made.
*   **Speaking:** Talking to others to convey information effectively and clearly.
*   **Service Orientation:** Actively looking for ways to help people or customers.
*   **Coordination:** Adjusting actions in relation to others' actions (teamwork).
*   **Troubleshooting:** Determining causes of operating errors and deciding what to do about it.
*   **Time Management:** Managing one's own time and the time of others efficiently.

### Holland Code / RIASEC Personality Profiles (6 Columns, Scale 1.0 - 7.0)
*   **Realistic (R):** Preference for practical, hands-on problems and working with tools, machinery, or plants.
*   **Investigative (I):** Preference for working with ideas, searching for facts, and figuring out problems mentally.
*   **Artistic (A):** Preference for creative exploration, visual design, and self-expression.
*   **Social (S):** Preference for working with, communicating with, and teaching or helping people.
*   **Enterprising (E):** Preference for starting up and carrying out projects, especially leading people and making business decisions.
*   **Conventional (C):** Preference for following set procedures and routines, working with data and details cleanly.
