# Project Standards — Partner 2

## Ownership Boundary

Partner 2 owns all modules listed below. Partner 1 modules must never be modified without explicit discussion.

### Partner 2 Modules
- Academic Management (Batch, Timetable, Attendance, Syllabus, Study Materials, Assignments)
- Finance & Fee Management (Fee Structures, Installments, Scholarships, Discounts, Collection, Receipts, Due Tracking)
- Examination Module (Question Bank UI, Test Creation, Exam Management, Results, Analytics)
- Dashboard & Reports (KPIs, Revenue, Attendance, Academic, Examination, Performance, Conversion, Charts)

### Partner 2 Database Tables
`batches`, `timetables`, `attendance`, `assignments`, `study_materials`, `fee_structures`, `fee_payments`, `discounts`, `scholarships`, `dashboard_metrics`, `reports`, `analytics`

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React, Tailwind CSS, React Router, Axios |
| Backend   | Node.js, Express.js                 |
| Database  | PostgreSQL via Prisma ORM           |
| Auth      | JWT, bcrypt                         |

---

## Folder Standards

### Backend
```
backend/
  src/
    controllers/     # One file per module
    routes/          # One file per module
    middleware/      # Shared middleware only
    utils/           # Helpers, JWT, logger
    prisma/
      schema.prisma
      seed.js
```

### Frontend
```
frontend/
  src/
    pages/           # One folder per module (PascalCase)
    components/      # Reusable UI components (PascalCase)
    services/        # API calls (camelCase, e.g. batchService.js)
    layouts/         # DashboardLayout, AuthLayout
    routes/          # AppRoutes.jsx, ProtectedRoute.jsx
    hooks/           # Custom hooks (e.g. useFetch.js)
```

---

## Naming Conventions

| Type        | Convention   | Example                  |
|-------------|--------------|--------------------------|
| Folders     | lowercase    | `academic/`, `finance/`  |
| Pages       | PascalCase   | `BatchPage.jsx`          |
| Components  | PascalCase   | `FeeCollectionForm.jsx`  |
| Services    | camelCase    | `feeService.js`          |
| Variables   | camelCase    | `feeAmount`              |
| Constants   | UPPER_CASE   | `MAX_INSTALLMENTS`       |
| DB Tables   | snake_case   | `fee_payments`           |

---

## Code Style Rules

- **Files:** Single responsibility. Keep files small and focused.
- **Components:** Functional only. No class components.
- **State:** `useState`, `useEffect`, Context API. No Redux.
- **Validation:** At API boundary (controller level). Trust internal calls.
- **Comments:** Only when the WHY is non-obvious.
- **Error handling:** Centralized via Express error middleware. No duplicate try/catch wrapping.

---

## Architecture Constraints

**Use:**
- Simple Express controllers
- Prisma directly (no repository layer)
- Simple service layer for business logic reuse

**Avoid:**
- Microservices
- Docker / Redis
- CQRS / Event-driven patterns
- Repository pattern
- Overengineering or unnecessary abstractions

---

## API Standards

### Base URL Pattern
```
/api/<module>
```

### Examples
```
GET    /api/batches
POST   /api/attendance
GET    /api/fees
POST   /api/reports/generate
```

### Standard Response Envelope
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": []
}
```

### HTTP Status Codes
| Situation             | Code |
|-----------------------|------|
| Success (read)        | 200  |
| Created               | 201  |
| Bad input             | 400  |
| Unauthenticated       | 401  |
| Forbidden (role)      | 403  |
| Not found             | 404  |
| Server error          | 500  |

---

## UI Standards

### Theme Tokens
| Token       | Value     | Usage                    |
|-------------|-----------|--------------------------|
| Primary     | `#4F46E5` | Buttons, active links    |
| Secondary   | `#0EA5E9` | Highlights, badges       |
| Background  | `#F8FAFC` | Page background          |
| Card        | `#FFFFFF` | Card surfaces            |
| Font        | Inter     | All text                 |

### Design Principles
- Modern, professional, clean (Notion / MS Admin aesthetic)
- Consistent spacing (8px base grid)
- Rounded corners (`rounded-xl` for cards, `rounded-lg` for inputs)
- Reusable components — never duplicate UI patterns
- Tables must support search, filter, and pagination
- Forms must show inline validation errors

---

## Git Rules

- Small, focused commits
- Meaningful commit messages: `feat(batch): add batch creation form`
- Never modify Partner 1 files
- Do not break existing routes or database models
- Reuse existing shared components (Button, Input, Modal, Table)
