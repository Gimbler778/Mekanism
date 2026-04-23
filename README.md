# Mekanism ATS — Phase 1

**Internal Applicant Tracking System for Vendor Management**  
Prepared for: Mekanism Technologies | Date: April 2026

---

## Phase 1 Deliverables

| # | Deliverable | Status | Location |
|---|-------------|--------|----------|
| 1 | User Stories (20 stories, P0–P2) | ✅ Complete | `docs/USER_STORIES.md` |
| 2 | Interactive Wireframes (8 screens) | ✅ Complete | `docs/wireframes.html` |
| 3 | Backend Foundation (Node.js + DrizzleORM + PostgreSQL) | ✅ Complete | `backend/` |
| 4 | Frontend Framework (React + shadcn + Tailwind) | ✅ Complete | `frontend/` |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js (ESM), Express.js |
| ORM | DrizzleORM |
| Database | PostgreSQL |
| Cloud | Amazon Web Services (deployment-ready) |
| Authentication | JWT + Google OAuth 2.0 (SSO) |
| State Management | TanStack Query (React Query) |
| Charts | Recharts |
| Form Handling | React Hook Form + Zod |

---

## Project Structure

```
mekanism-ats/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js          # PostgreSQL connection pool (DrizzleORM)
│   │   │   └── schema.js         # Complete database schema (all tables + relations)
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT authentication + role authorization
│   │   │   └── auditLog.js       # Automatic audit logging middleware
│   │   ├── controllers/
│   │   │   ├── authController.js       # Login, register, OAuth callback, /me
│   │   │   ├── vendorController.js     # CRUD + performance metrics
│   │   │   ├── requisitionController.js # CRUD + approval + vendor assignment
│   │   │   ├── candidateController.js   # Submit, list, status update
│   │   │   └── analyticsController.js   # Dashboard, vendor report, funnel
│   │   ├── routes/
│   │   │   └── index.js          # All API routes with auth guards
│   │   └── index.js              # Express server entry point
│   ├── drizzle.config.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AppLayout.tsx     # Sidebar + topbar shell
│   │   ├── hooks/
│   │   │   └── useAuth.tsx       # Auth context, login, logout
│   │   ├── lib/
│   │   │   ├── api.ts            # Axios client + typed API functions
│   │   │   └── utils.ts          # cn(), formatDate(), STATUS_COLORS
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx     # Login form + Google SSO button
│   │   │   ├── DashboardPage.tsx # Stat cards + pipeline chart + top vendors
│   │   │   ├── VendorsPage.tsx   # Vendor list + registration form
│   │   │   ├── RequisitionsPage.tsx # Requisition list + create/approve
│   │   │   ├── SubmissionsPage.tsx  # Candidate pipeline + submit form
│   │   │   └── AnalyticsPage.tsx    # Funnel + vendor report table + charts
│   │   ├── App.tsx               # Router + QueryClient + AuthProvider
│   │   ├── main.tsx
│   │   └── index.css             # Tailwind + CSS variables (shadcn theme)
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
└── docs/
    ├── USER_STORIES.md            # 20 user stories across 6 modules
    └── wireframes.html            # Interactive 8-screen wireframe prototype
```

---

## Database Schema (DrizzleORM)

### Tables

| Table | Description |
|-------|-------------|
| `users` | All users — Admin, HR, Hiring Manager, Vendor |
| `vendors` | Vendor company profiles |
| `vendor_contacts` | Contact persons per vendor |
| `vendor_users` | Link between vendor org and user accounts |
| `job_requisitions` | Job openings with full details |
| `requisition_vendors` | Vendors assigned to each requisition |
| `candidates` | Candidate profiles (email, resume, skills, etc.) |
| `candidate_submissions` | One submission per candidate per requisition per vendor |
| `submission_status_history` | Full audit trail of candidate stage changes |
| `interviews` | Interview records with feedback and rating |
| `audit_logs` | System-wide audit log of all actions |

### Enums

- **user_role**: `admin`, `hr`, `hiring_manager`, `vendor`
- **vendor_status**: `pending`, `active`, `inactive`, `blacklisted`
- **requisition_status**: `draft`, `pending_approval`, `approved`, `open`, `on_hold`, `closed`, `cancelled`
- **candidate_status**: `submitted`, `screened`, `shortlisted`, `interview_scheduled`, `interview_completed`, `offer_extended`, `hired`, `rejected`, `withdrawn`
- **interview_type**: `phone_screen`, `technical`, `hr`, `final`, `panel`

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/auth/google` | Public (OAuth redirect) |
| GET | `/api/auth/google/callback` | Public |

### Vendors
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/vendors` | Admin, HR, Hiring Manager |
| POST | `/api/vendors` | Admin, HR |
| GET | `/api/vendors/:id` | Admin, HR, Hiring Manager |
| PATCH | `/api/vendors/:id` | Admin, HR |
| GET | `/api/vendors/:id/performance` | Authenticated |

### Requisitions
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/requisitions` | Authenticated |
| POST | `/api/requisitions` | Admin, HR, Hiring Manager |
| GET | `/api/requisitions/:id` | Authenticated |
| PATCH | `/api/requisitions/:id` | Admin, HR, Hiring Manager |
| POST | `/api/requisitions/:id/approve` | Admin, HR |
| POST | `/api/requisitions/:id/vendors` | Admin, HR |

### Submissions & Candidates
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/submissions` | Authenticated |
| GET | `/api/submissions` | Authenticated |
| PATCH | `/api/submissions/:id/status` | Admin, HR, Hiring Manager |
| GET | `/api/candidates/:id` | Authenticated |

### Analytics
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/analytics/dashboard` | Admin, HR, Hiring Manager |
| GET | `/api/analytics/vendor-report` | Admin, HR |
| GET | `/api/analytics/hiring-funnel` | Admin, HR, Hiring Manager |

---

## Setup & Running

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### 1. Database Setup
```bash
createdb mekanism_ats
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, Google OAuth credentials
npm run db:generate   # Generate migration files
npm run db:migrate    # Apply migrations
npm run dev           # Start on http://localhost:3001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev           # Start on http://localhost:5173
```

### 4. View Wireframes
Open `docs/wireframes.html` in any browser — no server needed.

### 5. View User Stories
Open `docs/USER_STORIES.md` in any markdown viewer.

---

## Environment Variables (Backend)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mekanism_ats
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:5173
```

---

## Role Permissions Summary

| Feature | Admin | HR | Hiring Manager | Vendor |
|---------|-------|----|----------------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ❌ |
| Manage Vendors | ✅ | ✅ | View only | ❌ |
| Create Requisitions | ✅ | ✅ | ✅ | ❌ |
| Approve Requisitions | ✅ | ✅ | ❌ | ❌ |
| View Assigned Requisitions | ✅ | ✅ | ✅ | ✅ |
| Submit Candidates | ✅ | ✅ | ❌ | ✅ |
| Update Candidate Status | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ | ❌ |

---

## AWS Deployment Notes (Phase 2)

- **Frontend**: S3 + CloudFront (static hosting)
- **Backend**: EC2 or ECS Fargate behind ALB
- **Database**: RDS PostgreSQL (Multi-AZ for production)
- **Secrets**: AWS Secrets Manager for env variables
- **CI/CD**: GitHub Actions → CodePipeline

---

*Phase 1 complete. Ready for shortlisting review before Phase 2 development.*
