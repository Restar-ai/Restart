# RESTART Backend

Express API server for the RESTART Career Platform.

## Tech Stack

- Node.js
- Express
- CORS
- dotenv

## Structure

```txt
backend/
  src/
    app.js           # Express app setup, middleware, routes, error handlers
    index.js         # Server bootstrap
    controllers/     # HTTP request and response handlers
    middleware/      # Express middleware
    models/          # Database models
    routes/          # Route definitions
    services/        # Business logic
    utils/           # Shared helpers
    validators/      # Request validation
```

## Layering Pattern

Use this flow for new backend features:

```txt
route
  -> validator or middleware
  -> controller
  -> service
  -> model or external integration
```

Guidelines:

- Keep routes focused on URL and middleware registration.
- Keep controllers thin: read request data, call services, return responses.
- Put business rules in services.
- Put database access in models or repositories when the database layer is added.
- Put reusable request checks in validators or middleware.

## Environment

Copy `.env.example` to `.env` and adjust values when needed.

```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Scripts

Run from `backend/`:

```bash
npm run dev
npm run start
```

Or run from the project root:

```bash
npm run backend:dev
npm run backend:start
```

## Starter Endpoints

```txt
GET /api/hello
POST /api/echo
```

`GET /api/hello` is used by the frontend to verify the frontend-backend connection.

## Error Handling

Errors thrown inside async route handlers are forwarded through `asyncHandler()` and returned by the global error handler.

Current response shape:

```json
{
  "message": "Error message"
}
```
