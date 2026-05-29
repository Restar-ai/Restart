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
        ├── DashboardPage.jsx
        ├── AssessmentPage.jsx
        ├── AssessmentResultPage.jsx
        ├── CoursePage.jsx
        ├── ProfilePage.jsx
        ├── ParticipantProfile.jsx
        └── TrainerDashboard.jsx
```

## API Pattern

`src/api/client.js` handles base URL, JSON parsing, and error throwing.

Feature API modules call specific endpoints and are the only place that imports `client.js`:

```
src/api/authApi.js        → /api/auth/*
src/api/assessmentApi.js  → /api/assessment/*
src/api/courseApi.js      → /api/courses/* and /api/enroll, etc.
```

Page and component code calls feature API modules — never `fetch` directly.

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
