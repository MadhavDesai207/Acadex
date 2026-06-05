# Examination Module — Frontend — Partner 2

## Scope

Partner 2 owns the **UI layer** of the examination module. Partner 1 owns the backend controllers and database tables (`exams`, `exam_results`, `question_bank`, `subjects`). Partner 2 builds all the screens that surface this data.

> Partner 2 must not modify Partner 1's exam/result/question backend controllers. All frontend calls go through the existing Partner 1 API. Partner 2 may add new read endpoints if required, but must not alter existing ones.

---

## Screens Overview

| Screen                    | Route                      | Role Access                  |
|---------------------------|----------------------------|------------------------------|
| Question Bank UI          | `/question-bank`           | Admin, Faculty               |
| Test / Exam Creation      | `/exams/create`            | Admin, Faculty               |
| Exam Management List      | `/exams`                   | Admin, Faculty               |
| Exam Detail               | `/exams/:id`               | Admin, Faculty               |
| Result Entry              | `/exams/:id/results`       | Admin, Faculty               |
| Result View (Student)     | `/results`                 | Student                      |
| Analytics Overview        | `/analytics/exams`         | Admin, Faculty               |
| Performance Reports       | `/reports/performance`     | Admin                        |

---

## 1. Question Bank UI

### Purpose
Allow faculty to browse, create, edit, and filter questions. Questions are linked to a Subject and have difficulty, marks, options, and a correct answer.

### Connected API (Partner 1 Backend)
```
GET    /api/v1/questions          ?subjectId=&difficulty=&search=
POST   /api/v1/questions
PUT    /api/v1/questions/:id
DELETE /api/v1/questions/:id
```

### Page Behaviour
- Filters: Subject (dropdown), Difficulty (EASY / MEDIUM / HARD), search text
- Table columns: Question text (truncated), Subject, Difficulty, Marks, Created by, Actions
- "Add Question" button opens a modal form
- Edit icon opens the same modal pre-filled
- Delete shows confirmation before removing

### Form Fields
| Field          | Type      | Required | Notes                              |
|----------------|-----------|----------|------------------------------------|
| questionText   | textarea  | Yes      | Min 10 characters                  |
| subjectId      | select    | Yes      | Loaded from `/api/v1/subjects`     |
| options        | text[4]   | Yes      | Exactly 4 options                  |
| correctAnswer  | select    | Yes      | Must match one of the 4 options    |
| marks          | number    | Yes      | Min 1                              |
| difficulty     | select    | Yes      | EASY / MEDIUM / HARD               |

### Components

| File                                        | Description                           |
|---------------------------------------------|---------------------------------------|
| `pages/Examination/QuestionBankPage.jsx`    | List + filter view                    |
| `pages/Examination/QuestionForm.jsx`        | Add / edit question form (in modal)   |
| `components/DifficultyBadge.jsx`            | Colored badge for EASY/MEDIUM/HARD    |
| `services/questionService.js`               | API calls for question bank           |

---

## 2. Test / Exam Creation UI

### Purpose
Allow admin or faculty to create a new exam by selecting course, batch, exam type, date, marks, and optionally picking questions from the question bank.

### Connected API (Partner 1 Backend)
```
POST   /api/v1/exams
GET    /api/v1/courses          (populate course dropdown)
GET    /api/v1/batches          (populate batch dropdown)
GET    /api/v1/questions        (pick questions from bank)
```

### Form Fields
| Field        | Type     | Required | Notes                                      |
|--------------|----------|----------|--------------------------------------------|
| title        | text     | Yes      |                                            |
| courseId     | select   | Yes      | Loads active courses                       |
| batchId      | select   | No       | Filtered by selected course                |
| examType     | select   | Yes      | INTERNAL / EXTERNAL / PRACTICAL            |
| examDate     | date     | Yes      | Cannot be in the past                      |
| totalMarks   | number   | Yes      | Min 1                                      |
| passingMarks | number   | Yes      | Must be < totalMarks                       |

### Multi-Step Flow (optional enhancement)
1. Step 1: Fill exam metadata (above fields)
2. Step 2: Optional — pick questions from question bank (read-only preview)
3. Step 3: Confirm and submit

### Components

| File                                        | Description                           |
|---------------------------------------------|---------------------------------------|
| `pages/Examination/ExamCreatePage.jsx`      | Full create exam form                 |
| `pages/Examination/QuestionPicker.jsx`      | Filterable list to select questions   |
| `services/examService.js`                   | API calls for exam module             |

---

## 3. Exam Management List

### Purpose
Admin/Faculty sees all exams, can filter by course/batch/type/date, and navigate to result entry.

### Connected API
```
GET    /api/v1/exams            ?courseId=&batchId=&examType=&fromDate=&toDate=
DELETE /api/v1/exams/:id
```

### Table Columns
| Column       | Notes                                |
|--------------|--------------------------------------|
| Title        | Clickable → Exam Detail              |
| Course       | Course name                          |
| Batch        | Batch name or "All batches"          |
| Type         | INTERNAL / EXTERNAL / PRACTICAL      |
| Date         | Formatted date                       |
| Total Marks  |                                      |
| Results      | "Enter Results" button or "View"     |
| Actions      | Edit, Delete (Admin only)            |

### Components

| File                                        | Description                       |
|---------------------------------------------|-----------------------------------|
| `pages/Examination/ExamListPage.jsx`        | Table + filters                   |
| `components/ExamTypeBadge.jsx`              | Color-coded exam type badge       |

---

## 4. Result Entry Screen

### Purpose
Faculty enters marks for each student in a batch for a specific exam. System auto-calculates PASS/FAIL based on `passingMarks`.

### Connected API
```
GET    /api/v1/students         ?batchId=<batchId>   (load students)
POST   /api/v1/results/bulk     (bulk upsert results)
GET    /api/v1/results          ?examId=             (existing results)
```

### Screen Layout
- Header: Exam title, date, total/passing marks
- Bulk entry table: one row per student
  - Columns: Roll No, Student Name, Marks Obtained (input), Status (auto-computed), Remarks (optional)
- "Save All" button submits the full batch at once

### Auto-Compute Status
```
status = marksObtained >= passingMarks ? "PASS" : "FAIL"
```
Computed client-side before sending, displayed inline.

### Validation
- `marksObtained` must be 0 ≤ value ≤ `totalMarks`
- All rows must be filled before submitting (or allow partial save with warning)

### Components

| File                                           | Description                           |
|------------------------------------------------|---------------------------------------|
| `pages/Examination/ResultEntryPage.jsx`        | Bulk result entry table               |
| `components/ResultStatusBadge.jsx`             | PASS (green) / FAIL (red) badge       |
| `services/resultService.js`                    | API calls for results                 |

---

## 5. Result View (Student)

### Purpose
Students view their own exam results: marks, status, exam date, subject.

### Connected API
```
GET    /api/v1/students/:id/results
```

### Screen Layout
- Top: Student name, roll number, course, batch
- Table: Exam name, Type, Date, Total Marks, Marks Obtained, Status
- Summary: Total exams taken, Pass count, Fail count, average percentage

### Components

| File                                           | Description                             |
|------------------------------------------------|-----------------------------------------|
| `pages/Examination/StudentResultPage.jsx`      | Student's personal result history       |
| `components/ResultSummaryCard.jsx`             | Pass/fail/avg summary at top            |

---

## 6. Analytics & Performance Reports

### Purpose
Visual overview of exam performance across courses, batches, and subjects for admin and faculty.

### Data Sources (all read from Partner 1 tables)
```
GET  /api/v1/results             ?courseId=&batchId=&examId=
GET  /api/v1/exams               (for exam list)
GET  /api/v1/students            (for student count)
```

### Key Metrics to Display
| Metric                     | Visual Type     |
|----------------------------|-----------------|
| Pass/Fail ratio per exam   | Pie / Donut chart (CSS) |
| Avg marks per exam         | Bar chart (CSS bars)    |
| Top 5 students by avg score| Ranked list             |
| Exam-wise trend over time  | Line trend (CSS)        |
| Batch comparison           | Grouped bar             |

> Charts are built with pure CSS / Tailwind (no chart library). Consistent with the existing dashboard approach.

### Filters
- Course (required to load data)
- Batch (optional)
- Exam Type (optional)
- Date range

### Components

| File                                              | Description                             |
|---------------------------------------------------|-----------------------------------------|
| `pages/Examination/ExamAnalyticsPage.jsx`         | Full analytics dashboard                |
| `pages/Examination/PerformanceReportPage.jsx`     | Printable/exportable performance report |
| `components/PassFailChart.jsx`                    | Donut chart via CSS                     |
| `components/AvgMarksBarChart.jsx`                 | Bar chart via CSS                       |
| `components/TopStudentsList.jsx`                  | Ranked student list                     |
| `services/analyticsService.js`                    | Data fetch calls for analytics          |

---

## Routing Summary

Add to `App.jsx` (Partner 2 routes):

```
/question-bank             → QuestionBankPage        [Admin, Faculty]
/exams                     → ExamListPage            [Admin, Faculty]
/exams/create              → ExamCreatePage          [Admin, Faculty]
/exams/:id                 → ExamDetailPage          [Admin, Faculty]
/exams/:id/results         → ResultEntryPage         [Admin, Faculty]
/results                   → StudentResultPage       [Student]
/analytics/exams           → ExamAnalyticsPage       [Admin, Faculty]
/reports/performance       → PerformanceReportPage   [Admin]
```
