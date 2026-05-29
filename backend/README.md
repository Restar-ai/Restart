# RESTART Backend

Express REST API server for the RESTART Career Platform.

## Tech Stack

- Node.js + Express
- mysql2 (MySQL database)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- dotenv, cors

## Structure

```
backend/
└── src/
    ├── app.js              # Express app: middleware, route registration
    ├── index.js            # Server bootstrap
    ├── controllers/        # Request / response handlers
    │   ├── authController.js
    │   ├── assessmentController.js
    │   └── courseController.js
    ├── routes/             # Route definitions
    │   ├── authRoutes.js
    │   ├── assessmentRoutes.js
    │   └── courseRoutes.js
    ├── services/           # Database connection and helpers
    │   ├── db.js
    │   └── initDb.js
    ├── middleware/
    │   ├── asyncHandler.js
    │   └── errorHandler.js
    ├── seeders/            # Database seed scripts
    └── migrations/         # SQL migration files
```

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and receive JWT |
| POST | `/logout` | Logout |
| GET | `/profile` | Get authenticated user profile |
| PUT | `/update-profile` | Update profile info |
| PUT | `/update-address` | Update address |

### Assessment — `/api/assessment`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/questions` | Get all 16 assessment questions |
| POST | `/submit` | Submit answers → get ML-based career recommendations |
| POST | `/result` | Fetch saved assessment result for a user |

### Courses — `/api`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/courses` | List all courses |
| GET | `/courses/:id` | Get course detail |
| GET | `/users/:userId/courses` | Get courses enrolled by a user |
| POST | `/enroll` | Enroll in a course |
| PUT | `/progress` | Update course progress |
| GET | `/users/:userId/stats` | Get dashboard stats for a user |
| GET | `/trainer/dashboard` | Trainer dashboard data |

## Environment

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=restart_db

JWT_SECRET=your_secret_here

AI_SERVICE_URL=http://localhost:8000
```

`AI_SERVICE_URL` points to the FastAPI ML service. If unavailable, the assessment endpoint falls back to rule-based recommendations automatically.

## Scripts

Run from `backend/`:

```bash
npm run dev     # starts with --watch (auto-restart on file change)
npm run start   # production start
```

Or from the project root:

```bash
npm run backend:dev
npm run backend:start
```

## Layering Pattern

```
route → controller → service / DB query → JSON response
```

- **Routes** handle URL and middleware registration only.
- **Controllers** read request data, call business logic, return responses.
- **Services** contain database queries and shared utilities.

## Error Handling

Async route errors are caught by `asyncHandler()` and forwarded to the global error handler, which returns:

```json
{
  "message": "Error message"
}
```
