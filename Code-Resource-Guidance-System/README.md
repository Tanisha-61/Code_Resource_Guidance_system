# Code Resource Guidance System (CRGS)

A full-stack student platform for finding coding resources based on language, topic, skill level and resource type.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt

## Prerequisites
Install Node.js LTS and MongoDB Community Server. MongoDB Compass is optional but useful.

## Setup

### 1. Backend
Open a terminal in the project root:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update values if needed.

```bash
npm run seed:admin
npm run dev
```

Backend API runs at `http://localhost:5000`.

### 2. Frontend
Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Default admin account
The seed script reads these values from backend `.env`:
- ADMIN_NAME
- ADMIN_EMAIL
- ADMIN_PASSWORD

Set them before running `npm run seed:admin`. The script creates or updates the admin account.

## Main API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/resources`
- `GET /api/resources/:id`
- `POST /api/resources` (admin)
- `PUT /api/resources/:id` (admin)
- `DELETE /api/resources/:id` (admin)
- `GET /api/bookmarks`
- `POST /api/bookmarks/:resourceId`
- `DELETE /api/bookmarks/:resourceId`

## Notes
- The frontend uses `VITE_API_URL` (defaults to `http://localhost:5000/api`).
- Add real resource links and descriptions through the Admin area.
- Keep your `.env` private; never commit credentials.
