# Mekanism ATS

Internal Applicant Tracking System for vendor-driven hiring workflows.

## Overview

Mekanism ATS is a full-stack platform for managing:

- vendor onboarding and performance
- requisition intake and approvals
- candidate submissions and status flow
- hiring analytics and reporting

The repository is split into:

- `backend/` - Express API, PostgreSQL, Drizzle ORM
- `frontend/` - React + TypeScript + Vite + Tailwind UI
- `docs/` - user stories and wireframes

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Recharts

### Backend

- Node.js (ESM)
- Express
- Drizzle ORM
- PostgreSQL
- JWT auth + Google OAuth (Passport)

## Project Structure

```text
mekanism-ats/
  backend/
    src/
      config/
      controllers/
      db/
      middleware/
      routes/
      utils/
      index.js
    drizzle/
    drizzle.config.js
    package.json
  frontend/
    src/
      components/
      hooks/
      lib/
      pages/
      App.tsx
      main.tsx
      index.css
    package.json
    tsconfig.json
    vite.config.ts
  docs/
    USER_STORIES.md
    wireframes.html
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+

## Quick Start

### 1. Clone and install dependencies

```bash
# from repository root
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Update `.env` values for:

- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`

### 3. Create database and run migrations

```bash
# create DB once
createdb mekanism_ats

# apply schema
cd backend
npm run db:generate
npm run db:migrate
```

### 4. Run both apps

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

- API: `http://localhost:3001`
- API health: `http://localhost:3001/health`
- Frontend: `http://localhost:5173`

## Scripts

### Backend (`backend/package.json`)

- `npm run dev` - start API with nodemon
- `npm run start` - start API with node
- `npm run db:generate` - generate Drizzle migrations
- `npm run db:migrate` - apply migrations
- `npm run db:studio` - open Drizzle Studio

### Frontend (`frontend/package.json`)

- `npm run dev` - start Vite dev server
- `npm run build` - TypeScript check + production build
- `npm run preview` - preview production build locally

## Core API Areas

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/vendors`
- `POST /api/vendors`
- `GET /api/requisitions`
- `POST /api/requisitions`
- `GET /api/submissions`
- `POST /api/submissions`
- `GET /api/analytics/dashboard`

## Roles

System supports these roles:

- `admin`
- `hr`
- `hiring_manager`
- `vendor`

Authorization is enforced in backend middleware and route guards.

## Documentation

- User stories: `docs/USER_STORIES.md`
- Wireframes: `docs/wireframes.html`

## Notes

- CORS origin is controlled by `FRONTEND_URL` in backend `.env`.
- JWT is expected in `Authorization: Bearer <token>` for protected routes.
- Frontend uses `/api` base URL and assumes backend is reachable by same origin or proxy configuration.
