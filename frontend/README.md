# RESTART Frontend

React + Vite web client for the RESTART Career Platform.

## Tech Stack

- React
- Vite
- Tailwind CSS
- ESLint

## Structure

```txt
frontend/
  src/
    api/         # API client and feature-specific API modules
    assets/      # Static assets imported by React
    components/  # Reusable UI components
    constants/   # Shared constants
    hooks/       # Reusable React hooks
    pages/       # Page-level components
    store/       # Client-side state
    utils/       # Shared helpers
```

## API Pattern

Use `src/api/client.js` for low-level request behavior such as `fetch`, headers, JSON parsing, and error handling.

Create feature API modules for endpoint-specific calls:

```txt
src/api/authApi.js
src/api/jobsApi.js
src/api/learningApi.js
```

Current example:

```txt
src/api/helloApi.js
```

Page or component code should call feature API modules instead of calling `fetch` directly.

## Styling

Tailwind CSS is used as the main styling tool for the frontend. It lets components be styled directly with utility classes, so layout, spacing, color, and responsive behavior can stay close to the JSX that owns the UI.

Tailwind is installed through the official Vite plugin:

```txt
tailwindcss
@tailwindcss/vite
```

Global Tailwind styles are imported in `src/index.css`:

```css
@import "tailwindcss";
```

Use Tailwind utility classes for component-level styling. Add separate CSS files only when a style is reused often or is easier to maintain as a named class.

Simple example:

```jsx
<section className="mx-auto max-w-xl p-8">
  <h1 className="text-3xl font-bold text-slate-900">React + Vite + Express</h1>
</section>
```

## Environment

Copy `.env.example` to `.env` and adjust values when needed.

```env
VITE_APP_NAME=Restart Career Platform
VITE_API_URL=/api
```

During development, `/api` is proxied by Vite to `http://localhost:3000`.

## Scripts

Run from `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Or run from the project root:

```bash
npm run frontend:dev
npm run frontend:build
npm run frontend:lint
```

## Development Server

```txt
http://localhost:5173
```

The frontend expects the backend API to be available at `http://localhost:3000` when using the default Vite proxy setup.
