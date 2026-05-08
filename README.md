# RESTART Career Platform

RESTART is a web-based platform that helps former inmates rebuild their career pathway through structured learning, career preparation, and job opportunities that match their skills and interests.

This repository uses a separated frontend and backend setup:

- `frontend`: React + Vite web client.
- `backend`: Express REST API server.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, ESLint.
- Backend: Node.js, Express, CORS, dotenv.
- Package manager: npm.

## Repository Structure

```txt
restart-career-platform/
  backend/       # Express API application
  frontend/      # React + Vite application
  package.json   # Root scripts for running each app
```

For app-specific details, read:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## Getting Started

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Return to the project root:

```bash
cd ..
```

Start the backend API:

```bash
npm run backend:dev
```

Start the frontend in another terminal:

```bash
npm run frontend:dev
```

By default:

- Frontend runs on `http://localhost:5173`.
- Backend runs on `http://localhost:3000`.
- Frontend requests to `/api` are proxied to the backend during development.

## Available Root Scripts

```bash
npm run backend:dev
npm run backend:start
npm run frontend:dev
npm run frontend:build
npm run frontend:lint
```

## Request Flow

```txt
React page/component
  -> frontend API module
  -> frontend API client
  -> /api route
  -> Express route
  -> controller
  -> service
  -> JSON response
```

Current starter endpoint:

```txt
GET /api/hello
```
