# RESTART Frontend

React + Vite web client for the RESTART Career Platform.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router DOM

## Structure

```
frontend/
└── src/
    ├── App.jsx         # Route definitions
    ├── main.jsx        # App entry point
    ├── index.css       # Tailwind import
    ├── api/            # API client and feature modules
    │   ├── client.js        # Base fetch client (base URL, error handling)
    │   ├── authApi.js
    │   ├── assessmentApi.js
    │   └── courseApi.js
    └── pages/          # Page-level components
        ├── Login.jsx
        ├── Register.jsx
        ├── DashboardPage.jsx        # Main dashboard with AI chat window
        ├── AssessmentPage.jsx
        ├── AssessmentResultPage.jsx # Shows top-3 professions with confidence bars
        ├── CoursePage.jsx
        ├── ProfilePage.jsx
        ├── ParticipantProfile.jsx
        └── TrainerDashboard.jsx
```

## Key Pages

**DashboardPage** — Main participant page. Shows assessment results, enrolled courses, and an AI career assistant chat window. The chat window can be expanded/collapsed and sends full user context (assessment results, scores, course progress) to the backend with each message.

**AssessmentResultPage** — Displays top-3 ML-recommended professions with rank badges (1st/2nd/3rd), confidence percentage bars, and a "Powered by AI" badge.

## API Pattern

`src/api/client.js` handles base URL, JSON parsing, and error throwing.

Feature API modules call specific endpoints and are the only place that imports `client.js`:

```
src/api/authApi.js        → /api/auth/*
src/api/assessmentApi.js  → /api/assessment/*
src/api/courseApi.js      → /api/courses/* and /api/enroll, etc.
```

The chat AI (`POST /api/chat`) is called directly from `DashboardPage.jsx` using the native `fetch` API.

## Styling

Tailwind CSS utility classes are used for all component styling. Global styles are imported in `src/index.css`:

```css
@import "tailwindcss";
```

Brand colors used throughout:

| Name | Hex |
|------|-----|
| Navy | `#233B5E` |
| Soft Blue | `#CCD8E6` |
| Cream | `#F7F6EE` |

## Environment

Copy `.env.example` to `.env`:

```env
VITE_APP_NAME=Restart Career Platform
VITE_API_URL=/api
```

During development, `/api` is proxied by Vite to `http://localhost:5000` (backend).

## Scripts

Run from `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Or from the project root:

```bash
npm run frontend:dev
npm run frontend:build
npm run frontend:lint
```

## Development Server

```
http://localhost:5173
```
