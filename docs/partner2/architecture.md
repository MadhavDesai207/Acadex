# Architecture — Partner 2

## System Overview

Acadex is a monolithic Education ERP with a clear client-server split. The backend is a REST API built on Express + Prisma. The frontend is a React SPA. Both run as separate processes and communicate over HTTP.

```
Browser (React SPA)
      │
      │  HTTP/JSON  (JWT in Authorization header)
      ▼
Express REST API  (Node.js, port 5001)
      │
      │  Prisma Client
      ▼
PostgreSQL  (port 5432, database: edu_erp)
```

---

## Backend Architecture

### Request Lifecycle
```
HTTP Request
  → Express Router  (routes/moduleRoutes.js)
  → authenticate()  (middleware: verifies JWT, attaches req.user)
  → authorize()     (middleware: checks role permissions)
  → Controller      (controllers/moduleController.js)
  → Prisma Query    (direct, no repository layer)
  → JSON Response
```

### Layer Responsibilities

| Layer       | File Pattern               | Responsibility                              |
|-------------|----------------------------|---------------------------------------------|
| Route       | `routes/moduleRoutes.js`   | URL definitions, middleware wiring          |
| Controller  | `controllers/moduleCtrl.js`| Request parsing, validation, response shape |
| Prisma      | Direct in controller       | Database queries, transactions              |
| Middleware  | `middleware/`              | Auth, error handling, validation helpers    |
| Utils       | `utils/`                   | JWT helpers, logger, shared helpers         |

### When to use a Service Layer
Only extract a service function when the same business logic needs to be called from **two or more controllers**. Otherwise keep logic in the controller.

### Database Transactions
Use `prisma.$transaction()` whenever an operation must modify two or more tables atomically (e.g. creating a User + Faculty record together).

---

## Frontend Architecture

### Component Hierarchy
```
main.jsx
  └─ App.jsx  (Router + Route definitions)
       ├─ LoginPage
       └─ ProtectedRoute
            └─ DashboardLayout  (Navbar + Sidebar + main slot)
                 └─ <ModulePage>  (e.g. BatchPage, FeePage)
                      ├─ <ModuleTable>     (list view)
                      ├─ <ModuleForm>      (create/edit form)
                      └─ <ModuleModal>     (detail or confirm dialog)
```

### Data Flow Pattern
```
Page Component
  → useEffect → calls Service (axios)
  → stores result in useState
  → passes data as props to Table/Form components
  → user action → calls Service → refreshes state
```

### Service Layer
Each module has one service file (`src/services/moduleService.js`) that:
- Imports `apiClient` (the shared Axios instance)
- Exports one function per API call
- Never holds state
- Never formats UI — returns raw API data

### Auth Flow
1. `LoginPage` calls `authService.login()` → stores `token` + `user` in `localStorage`
2. `apiClient` interceptor reads `token` from `localStorage` on every request
3. On `401` response, interceptor clears storage and redirects to `/login`
4. `ProtectedRoute` reads `localStorage` to decide render vs redirect

---

## Database Design Principles

### ID Strategy
All primary keys are UUIDs (`@id @default(uuid()) @db.Uuid`). This matches the existing Partner 1 schema convention.

### Soft Deletes
Use `isActive Boolean @default(true)` instead of hard deletes for any entity that has business history (students, faculty, batches, fee records).

### Timestamps
Every table that tracks changes includes:
```prisma
createdAt  DateTime  @default(now())
updatedAt  DateTime  @updatedAt
```

### Relation Deletion Rules
| Scenario                                   | Rule             |
|--------------------------------------------|------------------|
| Parent deleted, child is historical record | `Restrict`       |
| Parent deleted, child loses meaning        | `Cascade`        |
| Parent deleted, child reference optional   | `SetNull`        |

### Decimal Fields
Use `@db.Decimal(10, 2)` for all monetary values (fees, salary, discounts).

### Date Fields
Use `@db.Date` for calendar dates (no time component). Use `DateTime` only when time of day matters.

---

## Partner Boundary Rules

### Tables owned by Partner 1 (read-only for Partner 2)
`users`, `students`, `faculty`, `courses`, `exams`, `exam_results`, `question_bank`, `subjects`, `admissions`, `inquiries`, `salary_records`, `faculty_attendance`

### How Partner 2 references Partner 1 data
- Use foreign keys pointing to `users.id`, `students.id`, `faculty.id`, `courses.id`, `batches.id`
- Never JOIN into Partner 1 tables from Partner 2 controllers to write data
- For reads (e.g. show student name in attendance), use `include` in Prisma — this is acceptable

### Shared Components (read, reuse, never modify)
`Button.jsx`, `Input.jsx`, `Modal.jsx`, `Table.jsx`, `Select.jsx`, `Navbar.jsx`, `Sidebar.jsx`, `DashboardLayout.jsx`

---

## Security Model

### Authentication
- JWT signed with `JWT_SECRET` env variable
- Token lifetime: `JWT_EXPIRES_IN` (default 7 days)
- Token sent as `Authorization: Bearer <token>` header
- Stored in `localStorage` on the client

### Authorization
Role hierarchy enforced in `authorize(...roles)` middleware:

| Role         | Access Level                               |
|--------------|--------------------------------------------|
| SUPER_ADMIN  | All routes (bypass all role checks)        |
| ADMIN        | Most management routes                     |
| FACULTY      | Read + own-record writes                   |
| RECEPTIONIST | Inquiry + Admission routes only            |
| STUDENT      | Own profile + own results only             |

### Input Validation
- Validated at the controller level before any Prisma call
- Return `400` with a descriptive message on invalid input
- Never trust client-supplied IDs without a DB existence check

---

## Environment Configuration

### Backend `.env`
```
NODE_ENV=development
PORT=5001
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/edu_erp?schema=public"
JWT_SECRET="<strong-secret>"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5001/api/v1
```

Partner 2 APIs will be registered under `/api/v1` (same base) but may also expose `/api/<module>` — see API Standards for details.
