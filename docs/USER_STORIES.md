# User Stories — Mekanism ATS
**Project:** Internal ATS for Vendor Management  
**Phase:** 1  
**Date:** April 2026

---

## 1. Authentication & Access Management

### US-001 — Admin Login
**As an** Admin,  
**I want to** log in with my email and password (or Google SSO),  
**So that** I can access the full ATS platform securely.

**Acceptance Criteria:**
- User can log in with valid email + password
- User can log in via Google OAuth/SSO
- Invalid credentials show a clear error message
- JWT token is issued and stored on success
- Inactive accounts are rejected with an informative message

---

### US-002 — Role-Based Access
**As an** Admin,  
**I want to** assign roles (Admin, HR, Hiring Manager, Vendor) to users,  
**So that** each user sees only the features relevant to their role.

**Acceptance Criteria:**
- Four roles exist: Admin, HR, Hiring Manager, Vendor
- Vendors can only submit candidates and view their own submissions
- Hiring Managers can view requisitions and update candidate status
- HR can manage vendors and requisitions, approve candidates
- Admin has full access to all features and audit logs

---

### US-003 — Audit Log
**As an** Admin,  
**I want to** see a log of all actions performed in the system,  
**So that** I can ensure accountability and trace changes.

**Acceptance Criteria:**
- Every create/update/delete action is logged with user, timestamp, and resource
- Login and logout events are captured
- Audit log is read-only and cannot be modified

---

## 2. Vendor Management

### US-004 — Vendor Registration
**As an** HR user,  
**I want to** register a new vendor with their company details and primary contact,  
**So that** vendors are onboarded into the system and can begin submitting candidates.

**Acceptance Criteria:**
- HR can fill a form with: company name, city, country, website, notes
- At least one primary contact (name, email, phone, designation) is required
- Vendor starts in "Pending" status upon creation
- Duplicate company names trigger a warning

---

### US-005 — Vendor Profile Management
**As an** HR user,  
**I want to** view and edit a vendor's profile including their contacts and agreements,  
**So that** vendor information stays accurate and up to date.

**Acceptance Criteria:**
- Full vendor profile page shows all details
- Multiple contacts can be managed (add, edit, mark primary)
- Status can be changed: Pending → Active → Inactive / Blacklisted
- Contract start/end dates can be recorded

---

### US-006 — Vendor Performance Dashboard
**As an** HR user or Admin,  
**I want to** see vendor performance metrics (submissions, hires, rating, hire ratio),  
**So that** I can evaluate which vendors deliver the best candidates.

**Acceptance Criteria:**
- Per-vendor stats: total submissions, total hires, hiring ratio %
- Star rating displayed (0–5)
- Top vendors ranked by hiring ratio and volume
- Data updates automatically as new submissions and hires are recorded

---

### US-007 — Vendor Search & Filter
**As an** HR user,  
**I want to** search vendors by name and filter by status,  
**So that** I can quickly find the vendor I need.

**Acceptance Criteria:**
- Search input filters vendors by company name (case-insensitive)
- Status filter: All / Pending / Active / Inactive / Blacklisted
- Results are paginated (20 per page)

---

## 3. Job Requisition Management

### US-008 — Create Job Requisition
**As an** HR user or Hiring Manager,  
**I want to** create a job requisition with all role details,  
**So that** vendors know exactly what type of candidate to submit.

**Acceptance Criteria:**
- Form fields: title, department, location, description, requirements, skills, openings, experience range, budget range, target start date, closing date
- A unique requisition code is auto-generated (e.g. REQ-ABC123-XYZ)
- Requisition is saved in "Draft" status initially

---

### US-009 — Requisition Approval Workflow
**As an** HR user or Admin,  
**I want to** approve requisitions submitted by hiring managers,  
**So that** only validated job openings are shared with vendors.

**Acceptance Criteria:**
- Hiring Manager submits a requisition → status changes to "Pending Approval"
- HR/Admin reviews and approves → status changes to "Approved" then "Open"
- HR/Admin can reject with a reason
- Approver's name and timestamp are recorded

---

### US-010 — Assign Vendors to Requisition
**As an** HR user,  
**I want to** assign specific vendors to a requisition,  
**So that** only relevant vendors can submit candidates for that role.

**Acceptance Criteria:**
- Multi-select vendor assignment per requisition
- Vendor users can only see requisitions they are assigned to
- Assignment can be updated at any time by HR

---

### US-011 — Requisition Search & Filter
**As any** internal user,  
**I want to** search and filter requisitions by title and status,  
**So that** I can quickly navigate to the roles I'm working on.

**Acceptance Criteria:**
- Search by title (live search)
- Filter by status
- Paginated results

---

## 4. Candidate Management

### US-012 — Vendor Candidate Submission
**As a** Vendor user,  
**I want to** submit a candidate profile for a specific open requisition,  
**So that** my candidates are considered for the role.

**Acceptance Criteria:**
- Vendor can fill: candidate name, email, phone, LinkedIn, resume URL, current title/company, experience, skills, expected salary, notice period, and a cover note
- Vendor selects from requisitions they are assigned to
- Upon submission, candidate status = "Submitted"

---

### US-013 — Duplicate Candidate Detection
**As an** HR user,  
**I want** the system to detect if a candidate's email has already been submitted for the same requisition,  
**So that** vendors don't submit the same candidate twice.

**Acceptance Criteria:**
- If same email + same requisition exists, submission is blocked with a 409 error
- Clear message is shown to the vendor explaining the duplicate
- Cross-requisition duplicates are flagged but not blocked

---

### US-014 — Candidate Status Tracking
**As an** HR user or Hiring Manager,  
**I want to** move a candidate through hiring stages,  
**So that** everyone has real-time visibility into the pipeline.

**Acceptance Criteria:**
- Status pipeline: Submitted → Screened → Shortlisted → Interview Scheduled → Interview Completed → Offer Extended → Hired / Rejected / Withdrawn
- Each status change is logged with the user, timestamp, and optional notes
- Rejection requires a reason

---

### US-015 — Candidate Pipeline View
**As an** HR user or Hiring Manager,  
**I want to** view all candidate submissions filtered by stage,  
**So that** I can focus on candidates at a specific step in the process.

**Acceptance Criteria:**
- Filter chips for each stage
- Table shows candidate name, email, current title, vendor, requisition, experience, submitted date
- Status can be updated inline

---

## 5. Workflow & Pipeline Tracking

### US-016 — Real-Time Pipeline Visibility
**As any** internal user,  
**I want to** see a live dashboard of the hiring pipeline,  
**So that** I always know how many candidates are at each stage.

**Acceptance Criteria:**
- Dashboard shows total counts per stage as a bar chart
- Numbers update without page refresh (via query invalidation)
- Visible to Admin, HR, and Hiring Manager roles

---

### US-017 — Interview Scheduling
**As an** HR user or Hiring Manager,  
**I want to** schedule interviews for shortlisted candidates and capture feedback,  
**So that** interview details are centralized and not scattered across emails.

**Acceptance Criteria:**
- Schedule interview with: type, date/time, duration, location or meeting link, interviewers
- Post-interview: record feedback, rating (1–5), and outcome
- Interview status: Scheduled → Completed / Cancelled / No-Show

---

## 6. Reporting & Analytics

### US-018 — Dashboard Summary Stats
**As an** Admin or HR user,  
**I want to** see key metrics on the dashboard (open requisitions, total submissions, active vendors, total hires),  
**So that** I have an at-a-glance view of hiring health.

**Acceptance Criteria:**
- 4 stat cards displayed prominently
- Data is fetched from live database
- Cards update on page load

---

### US-019 — Vendor Performance Report
**As an** Admin or HR user,  
**I want to** view a sortable table of all vendors with their submission count, hire count, hire rate, and rating,  
**So that** I can make data-driven decisions about which vendors to prioritize.

**Acceptance Criteria:**
- Full vendor report table with all metrics
- Hire rate (%) is computed server-side
- Data can be exported (Phase 2)

---

### US-020 — Hiring Funnel Analytics
**As an** Admin or HR user,  
**I want to** see a visual funnel showing candidate drop-off at each stage,  
**So that** I can identify bottlenecks in the hiring process.

**Acceptance Criteria:**
- Horizontal bar chart showing count per stage in pipeline order
- Can be filtered by requisition (dropdown)
- Chart is rendered using Recharts

---

## Story Summary Table

| ID | Story Title | Role | Priority |
|----|-------------|------|----------|
| US-001 | Admin Login | Admin / All | P0 |
| US-002 | Role-Based Access | Admin | P0 |
| US-003 | Audit Log | Admin | P1 |
| US-004 | Vendor Registration | HR | P0 |
| US-005 | Vendor Profile Management | HR | P1 |
| US-006 | Vendor Performance Dashboard | HR / Admin | P1 |
| US-007 | Vendor Search & Filter | HR | P1 |
| US-008 | Create Job Requisition | HR / HM | P0 |
| US-009 | Requisition Approval Workflow | HR / Admin | P0 |
| US-010 | Assign Vendors to Requisition | HR | P1 |
| US-011 | Requisition Search & Filter | All Internal | P1 |
| US-012 | Vendor Candidate Submission | Vendor | P0 |
| US-013 | Duplicate Candidate Detection | System | P0 |
| US-014 | Candidate Status Tracking | HR / HM | P0 |
| US-015 | Candidate Pipeline View | HR / HM | P0 |
| US-016 | Real-Time Pipeline Visibility | All Internal | P1 |
| US-017 | Interview Scheduling | HR / HM | P2 |
| US-018 | Dashboard Summary Stats | Admin / HR | P1 |
| US-019 | Vendor Performance Report | Admin / HR | P1 |
| US-020 | Hiring Funnel Analytics | Admin / HR | P2 |

**Priority Legend:** P0 = Must Have (Phase 1 core), P1 = Should Have, P2 = Nice to Have / Phase 2
