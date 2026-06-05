# Dashboard & Reports — Partner 2

## Scope

Partner 2 owns the full dashboard UI and all report screens. The existing `DashboardPage.jsx` (Partner 1) contains static placeholder data. Partner 2 replaces the data layer with real API calls and adds dedicated report pages.

> Do not modify DashboardLayout, Navbar, or Sidebar — these are Partner 1 components.

---

## Dashboard Overview

### Role-Based Dashboard Views

| Role          | View Content                                                             |
|---------------|--------------------------------------------------------------------------|
| SUPER_ADMIN   | All KPIs: students, faculty, revenue, admissions, attendance, exams      |
| ADMIN         | Same as SUPER_ADMIN                                                      |
| FACULTY       | Own batches, attendance summary, upcoming exams, assignment status       |
| STUDENT       | Enrolled batch, own attendance %, pending assignments, latest results    |
| RECEPTIONIST  | Today's inquiries, pending admissions, follow-up reminders               |

---

## Dashboard API

All dashboard data is served from a single aggregated endpoint to minimize round-trips.

### Endpoint
```
GET /api/dashboard
```
Auth: Required (all roles). Response is shaped per the caller's role server-side.

### Response Structure

```json
{
  "success": true,
  "data": {
    "role": "ADMIN",
    "kpis": {
      "totalStudents": 0,
      "activeStudents": 0,
      "totalFaculty": 0,
      "newInquiriesThisMonth": 0,
      "pendingAdmissions": 0,
      "revenueThisMonth": 0,
      "overdueFeesCount": 0
    },
    "charts": {
      "admissionsByMonth": [{ "month": "Jan", "count": 0 }],
      "revenueByMonth":    [{ "month": "Jan", "amount": 0 }],
      "attendanceRate":    [{ "batch": "Batch A", "rate": 0 }],
      "passFailRatio":     { "pass": 0, "fail": 0 }
    },
    "recentActivity": {
      "recentInquiries":  [],
      "pendingAdmissions": [],
      "overdueStudents":  [],
      "upcomingExams":    []
    }
  }
}
```

### Controller Logic (per role)
- **ADMIN/SUPER_ADMIN:** Queries all KPI tables, aggregates monthly data
- **FACULTY:** Queries only own batches, attendance records, upcoming exams
- **STUDENT:** Queries own attendance, own results, own assignments
- **RECEPTIONIST:** Queries inquiries created today + admissions pending review

---

## KPI Cards

### Admin KPI Cards

| Card Title               | Data Source                   | Color Variant |
|--------------------------|-------------------------------|---------------|
| Total Active Students    | `students` table              | indigo        |
| Active Faculty           | `faculty` table               | amber         |
| Revenue This Month       | `fee_payments` sum            | emerald       |
| Pending Admissions       | `admissions` count (APPLIED)  | rose          |
| New Inquiries (Month)    | `inquiries` count             | sky           |
| Overdue Fee Students     | `student_fees` + installments | orange        |

### Component: `StatsCard.jsx`
Reuse the existing Partner 1 `StatsCard` component. Pass:
- `title` — card label
- `value` — computed number/string
- `icon` — Lucide icon
- `change` — delta text (e.g. "+12%")
- `isPositive` — boolean for color
- `description` — sub-label
- `variant` — color theme

---

## Charts

All charts are pure CSS/Tailwind bar and donut implementations. No chart libraries.

### Chart 1: Monthly Admission Conversions
- Type: Vertical bar chart
- Data: Count of admissions with `status = ENROLLED` per month (last 6 months)
- Color: Brand indigo gradient

### Chart 2: Monthly Revenue
- Type: Vertical bar chart
- Data: Sum of `fee_payments.amountPaid` per month (last 6 months)
- Color: Emerald gradient

### Chart 3: Batch Attendance Rate
- Type: Horizontal bar chart
- Data: Average attendance % per active batch
- Color: Sky gradient

### Chart 4: Pass / Fail Ratio
- Type: Donut chart (two-segment CSS)
- Data: Count of PASS vs FAIL results across all recent exams

### Component Files

| File                                      | Description                             |
|-------------------------------------------|-----------------------------------------|
| `components/BarChart.jsx`                 | Reusable vertical bar chart (CSS)       |
| `components/HorizontalBarChart.jsx`       | Reusable horizontal bar chart (CSS)     |
| `components/DonutChart.jsx`               | Two-segment donut via SVG or CSS        |

---

## Report Pages

### 1. Revenue Report

**Route:** `/reports/revenue`
**Access:** Admin, Super Admin

**Filters:**
- Date range (from / to)
- Course
- Payment method

**Content:**
- Total collected in period
- Breakdown by course
- Breakdown by payment method
- List of all payments (table with export)

**Table Columns:** Student, Course, Installment, Amount, Method, Date, Receipt No., Collected By

---

### 2. Attendance Report

**Route:** `/reports/attendance`
**Access:** Admin, Faculty

**Filters:**
- Batch (required)
- Date range
- Student (optional — for single-student view)

**Content:**
- Per-student attendance percentage table
- Color-coded: ≥75% = green, 50–74% = amber, <50% = red
- Summary: total working days, avg attendance across batch

---

### 3. Academic Report (Syllabus Coverage)

**Route:** `/reports/academic`
**Access:** Admin, Faculty

**Filters:**
- Course
- Subject (optional)
- Batch

**Content:**
- Syllabus coverage % per subject per batch
- List of covered vs uncovered units
- Faculty who marked each unit

---

### 4. Examination Report

**Route:** `/reports/examination`
**Access:** Admin, Faculty

**Filters:**
- Course
- Batch
- Exam type
- Date range

**Content:**
- Exam list with pass/fail counts and average marks
- Top and bottom 5 performing students
- Per-subject performance breakdown

---

### 5. Performance Report (Student)

**Route:** `/reports/performance`
**Access:** Admin (all students), Faculty (own batches), Student (own only)

**Filters (Admin/Faculty):**
- Batch
- Student search

**Content:**
- Student profile summary
- Attendance percentage
- Exam results table
- Assignment completion rate
- Overall performance rating (computed: avg exam score + attendance rate)

---

### 6. Conversion Report (CRM Funnel)

**Route:** `/reports/conversion`
**Access:** Admin, Super Admin

**Filters:**
- Date range
- Source (walk-in, referral, website, etc.)
- Assigned staff

**Content:**
- Inquiry funnel: NEW → CONTACTED → INTERESTED → CONVERTED → DROPPED
- Conversion rate %
- Avg days from inquiry to conversion
- Breakdown by staff member

---

### 7. Due Fee Report

**Route:** `/reports/due-fees`
**Access:** Admin

**Filters:**
- Course
- Batch
- Overdue by (days: 0–30, 31–60, 60+)

**Content:**
- List of students with overdue installments
- Total overdue amount
- Per-student overdue breakdown
- "Send reminder" action (placeholder)

---

## Frontend Files Summary

| File                                          | Description                              |
|-----------------------------------------------|------------------------------------------|
| `pages/Dashboard/DashboardPage.jsx`           | Role-based dashboard (replace static data)|
| `pages/Dashboard/StatsCard.jsx`               | KPI card (reuse existing)                |
| `pages/Reports/RevenueReportPage.jsx`         | Revenue report                           |
| `pages/Reports/AttendanceReportPage.jsx`      | Attendance report                        |
| `pages/Reports/AcademicReportPage.jsx`        | Syllabus coverage report                 |
| `pages/Reports/ExaminationReportPage.jsx`     | Exam pass/fail report                    |
| `pages/Reports/PerformanceReportPage.jsx`     | Student performance report               |
| `pages/Reports/ConversionReportPage.jsx`      | CRM conversion funnel                    |
| `pages/Reports/DueFeeReportPage.jsx`          | Overdue fee report                       |
| `components/BarChart.jsx`                     | Vertical bar chart (CSS)                 |
| `components/HorizontalBarChart.jsx`           | Horizontal bar chart (CSS)               |
| `components/DonutChart.jsx`                   | Donut chart                              |
| `components/ReportFilterBar.jsx`              | Shared filter row for all report pages   |
| `components/ExportButton.jsx`                 | Trigger print / CSV export               |
| `services/dashboardService.js`                | Dashboard API call                       |
| `services/reportService.js`                   | All report API calls                     |

---

## Routing Summary

Add to `App.jsx`:
```
/dashboard              → DashboardPage            [All roles]
/reports/revenue        → RevenueReportPage        [Admin]
/reports/attendance     → AttendanceReportPage     [Admin, Faculty]
/reports/academic       → AcademicReportPage       [Admin, Faculty]
/reports/examination    → ExaminationReportPage    [Admin, Faculty]
/reports/performance    → PerformanceReportPage    [Admin, Faculty, Student]
/reports/conversion     → ConversionReportPage     [Admin]
/reports/due-fees       → DueFeeReportPage         [Admin]
```

---

## Sidebar Navigation Additions (Partner 2)

Add a "Reports" section to the existing `Sidebar.jsx` nav items array:

```js
{
  label: 'Reports',
  path: '/reports/revenue',
  icon: FileBarChart2,
  roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY']
}
```

> Add only nav entries. Do not restructure the Sidebar component itself.
