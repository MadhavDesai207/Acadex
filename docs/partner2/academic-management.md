# Academic Management — Partner 2

## Modules Overview

| Module            | Description                                              |
|-------------------|----------------------------------------------------------|
| Batch Management  | Create and manage student batches per course             |
| Timetable         | Schedule classes (subject, faculty, room, time slot)     |
| Attendance        | Mark and track student attendance per batch/date         |
| Syllabus Tracking | Define course syllabus units and track completion        |
| Study Materials   | Upload and distribute learning resources per subject     |
| Assignment Mgmt   | Create, distribute, collect, and grade assignments       |

---

## 1. Batch Management

### Purpose
Group students into batches under a course. Assign a faculty member. Track batch lifecycle (active / archived).

> Note: The `batches` table already exists in Partner 1's schema with fields: `id`, `name`, `courseId`, `startDate`, `endDate`, `facultyId`, `isActive`. Partner 2 extends this with additional operations and the UI.

### Additional Schema (extends existing `batches`)
No new table needed. Leverage the existing Prisma `Batch` model.

### API Endpoints

| Method | Endpoint               | Role Access          | Description                     |
|--------|------------------------|----------------------|---------------------------------|
| GET    | `/api/batches`         | Admin, Faculty       | List all batches (filterable)   |
| POST   | `/api/batches`         | Admin                | Create new batch                |
| GET    | `/api/batches/:id`     | Admin, Faculty       | Get batch detail with students  |
| PUT    | `/api/batches/:id`     | Admin                | Update batch info               |
| PATCH  | `/api/batches/:id/toggle-status` | Admin   | Activate / deactivate batch     |
| GET    | `/api/batches/:id/students` | Admin, Faculty | List students in a batch        |

### Key Business Rules
- A batch must belong to an active Course
- `facultyId` is optional at creation; can be assigned later
- Deactivating a batch does NOT deactivate enrolled students
- `endDate` is optional; batch stays active until explicitly deactivated
- Roll number generation for students uses batch's `courseId`

### Frontend Pages & Components

| File                          | Description                            |
|-------------------------------|----------------------------------------|
| `pages/Batch/BatchPage.jsx`   | List view with search + filter         |
| `pages/Batch/BatchForm.jsx`   | Create / edit form (modal or page)     |
| `pages/Batch/BatchDetail.jsx` | Batch detail with enrolled student list|
| `components/BatchTable.jsx`   | Reusable table component for batches   |
| `services/batchService.js`    | All API calls for batch module         |

### Filters Supported
- Filter by `courseId`
- Filter by `isActive`
- Search by batch name

---

## 2. Timetable Management

### Purpose
Schedule recurring class slots for a batch. Each slot defines: subject, faculty, day of week, start time, end time, room (optional).

### Database Schema

```prisma
model Timetable {
  id        String   @id @default(uuid()) @db.Uuid
  batchId   String   @db.Uuid
  subjectId String   @db.Uuid
  facultyId String   @db.Uuid
  dayOfWeek Int      // 1=Monday … 7=Sunday
  startTime String   // "HH:MM" 24-hour format
  endTime   String   // "HH:MM" 24-hour format
  room      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  batch     Batch    @relation(fields: [batchId], references: [id], onDelete: Restrict)
  subject   Subject  @relation(fields: [subjectId], references: [id], onDelete: Restrict)
  faculty   Faculty  @relation(fields: [facultyId], references: [id], onDelete: Restrict)

  @@map("timetables")
  @@index([batchId])
  @@index([facultyId])
}
```

### API Endpoints

| Method | Endpoint                          | Role Access    | Description                        |
|--------|-----------------------------------|----------------|------------------------------------|
| GET    | `/api/timetable`                  | All            | List slots (filter by batch/faculty)|
| POST   | `/api/timetable`                  | Admin          | Create a slot                      |
| PUT    | `/api/timetable/:id`              | Admin          | Update a slot                      |
| DELETE | `/api/timetable/:id`              | Admin          | Remove a slot                      |
| GET    | `/api/timetable/batch/:batchId`   | All            | Weekly schedule for a batch        |
| GET    | `/api/timetable/faculty/:facultyId` | Admin, Faculty | Faculty's weekly schedule         |

### Key Business Rules
- No two slots for the same batch can overlap on the same day and time
- No faculty should be double-booked (same day, overlapping time)
- `startTime` must be before `endTime`
- `dayOfWeek` must be 1–7

### Frontend Pages & Components

| File                                    | Description                              |
|-----------------------------------------|------------------------------------------|
| `pages/Timetable/TimetablePage.jsx`     | Weekly grid view per batch               |
| `pages/Timetable/TimetableForm.jsx`     | Add / edit slot form                     |
| `components/WeeklyGrid.jsx`             | 7-column grid rendered from slot data    |
| `services/timetableService.js`          | All API calls                            |

---

## 3. Attendance Management

### Purpose
Mark daily attendance for students in a batch. View historical attendance. Generate per-student attendance percentage.

> Note: `FacultyAttendance` already exists in Partner 1. This module covers **student** attendance only.

### Database Schema

```prisma
model Attendance {
  id        String           @id @default(uuid()) @db.Uuid
  studentId String           @db.Uuid
  batchId   String           @db.Uuid
  date      DateTime         @db.Date
  status    AttendanceStatus // Reuse existing enum: PRESENT, ABSENT, HALF_DAY, ON_LEAVE
  markedBy  String?          @db.Uuid
  note      String?
  student   Student          @relation(fields: [studentId], references: [id], onDelete: Cascade)
  batch     Batch            @relation(fields: [batchId], references: [id], onDelete: Restrict)
  marker    User?            @relation(fields: [markedBy], references: [id], onDelete: SetNull)

  @@unique([studentId, batchId, date])
  @@map("attendance")
  @@index([batchId, date])
  @@index([studentId])
}
```

### API Endpoints

| Method | Endpoint                                | Role Access         | Description                          |
|--------|-----------------------------------------|---------------------|--------------------------------------|
| POST   | `/api/attendance/bulk`                  | Admin, Faculty      | Mark attendance for whole batch/date |
| GET    | `/api/attendance`                       | Admin, Faculty      | Query by batchId + date              |
| GET    | `/api/attendance/student/:studentId`    | Admin, Faculty, Student | Student's attendance history    |
| GET    | `/api/attendance/summary/:batchId`      | Admin, Faculty      | Per-student % for a batch            |
| PUT    | `/api/attendance/:id`                   | Admin               | Correct a single attendance record   |

### Key Business Rules
- One record per `(studentId, batchId, date)` — enforced by unique constraint
- Bulk mark creates or upserts all students in a batch for a given date
- Students can only view their own attendance records
- Attendance percentage = `PRESENT + HALF_DAY * 0.5` / total working days

### Frontend Pages & Components

| File                                         | Description                           |
|----------------------------------------------|---------------------------------------|
| `pages/Attendance/AttendancePage.jsx`        | View by batch + date filter           |
| `pages/Attendance/AttendanceMarkForm.jsx`    | Bulk mark form: list students + radio |
| `pages/Attendance/AttendanceSummary.jsx`     | Per-student percentage table          |
| `components/AttendanceStatusBadge.jsx`       | Color-coded status pill               |
| `services/attendanceService.js`              | All API calls                         |

---

## 4. Syllabus Tracking

### Purpose
Define the syllabus for a course as units/topics. Faculty marks topics as covered against a batch.

### Database Schema

```prisma
model SyllabusUnit {
  id          String   @id @default(uuid()) @db.Uuid
  courseId    String   @db.Uuid
  subjectId   String   @db.Uuid
  unitNumber  Int
  title       String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Restrict)
  subject     Subject  @relation(fields: [subjectId], references: [id], onDelete: Restrict)
  progress    SyllabusProgress[]

  @@map("syllabus_units")
  @@index([courseId, subjectId])
}

model SyllabusProgress {
  id           String       @id @default(uuid()) @db.Uuid
  unitId       String       @db.Uuid
  batchId      String       @db.Uuid
  isCovered    Boolean      @default(false)
  coveredAt    DateTime?
  coveredBy    String?      @db.Uuid
  unit         SyllabusUnit @relation(fields: [unitId], references: [id], onDelete: Cascade)
  batch        Batch        @relation(fields: [batchId], references: [id], onDelete: Restrict)
  coveredByUser User?       @relation(fields: [coveredBy], references: [id], onDelete: SetNull)

  @@unique([unitId, batchId])
  @@map("syllabus_progress")
}
```

### API Endpoints

| Method | Endpoint                                        | Role Access     | Description                          |
|--------|-------------------------------------------------|-----------------|--------------------------------------|
| GET    | `/api/syllabus/units`                           | All             | List units by courseId + subjectId   |
| POST   | `/api/syllabus/units`                           | Admin           | Add a syllabus unit                  |
| PUT    | `/api/syllabus/units/:id`                       | Admin           | Edit unit title/description          |
| DELETE | `/api/syllabus/units/:id`                       | Admin           | Remove a unit                        |
| GET    | `/api/syllabus/progress/:batchId`               | All             | Get coverage % for a batch           |
| PATCH  | `/api/syllabus/progress/:unitId/:batchId`       | Admin, Faculty  | Mark / unmark a unit as covered      |

### Frontend Pages & Components

| File                                       | Description                             |
|--------------------------------------------|-----------------------------------------|
| `pages/Syllabus/SyllabusPage.jsx`          | Units list with coverage progress bar   |
| `pages/Syllabus/SyllabusUnitForm.jsx`      | Add / edit unit form                    |
| `components/SyllabusCoverageBar.jsx`       | Progress bar: X of Y units covered      |
| `services/syllabusService.js`              | All API calls                           |

---

## 5. Study Materials

### Purpose
Attach downloadable/viewable learning resources (PDFs, links, notes) to a subject or batch.

### Database Schema

```prisma
enum MaterialType {
  PDF
  LINK
  VIDEO
  NOTE
}

model StudyMaterial {
  id          String       @id @default(uuid()) @db.Uuid
  title       String
  description String?
  type        MaterialType
  url         String
  subjectId   String       @db.Uuid
  batchId     String?      @db.Uuid
  uploadedBy  String       @db.Uuid
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  subject     Subject      @relation(fields: [subjectId], references: [id], onDelete: Restrict)
  batch       Batch?       @relation(fields: [batchId], references: [id], onDelete: SetNull)
  uploader    User         @relation(fields: [uploadedBy], references: [id], onDelete: Restrict)

  @@map("study_materials")
  @@index([subjectId])
  @@index([batchId])
}
```

### API Endpoints

| Method | Endpoint                    | Role Access          | Description                         |
|--------|-----------------------------|----------------------|-------------------------------------|
| GET    | `/api/materials`            | All                  | List by subjectId or batchId        |
| POST   | `/api/materials`            | Admin, Faculty       | Add a material entry                |
| PUT    | `/api/materials/:id`        | Admin, Faculty       | Update material details             |
| DELETE | `/api/materials/:id`        | Admin                | Soft delete (isActive = false)      |

### Frontend Pages & Components

| File                                       | Description                          |
|--------------------------------------------|--------------------------------------|
| `pages/Materials/MaterialsPage.jsx`        | Grid of materials per subject/batch  |
| `pages/Materials/MaterialForm.jsx`         | Add / edit material form             |
| `components/MaterialCard.jsx`             | Card showing title, type, link       |
| `services/materialService.js`             | All API calls                        |

---

## 6. Assignment Management

### Purpose
Faculty creates assignments for a batch. Students submit (acknowledged). Faculty grades submissions.

### Database Schema

```prisma
enum AssignmentStatus {
  DRAFT
  PUBLISHED
  CLOSED
}

model Assignment {
  id          String           @id @default(uuid()) @db.Uuid
  title       String
  description String?
  batchId     String           @db.Uuid
  subjectId   String           @db.Uuid
  createdBy   String           @db.Uuid
  dueDate     DateTime         @db.Date
  maxMarks    Int              @default(100)
  status      AssignmentStatus @default(DRAFT)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  batch       Batch            @relation(fields: [batchId], references: [id], onDelete: Restrict)
  subject     Subject          @relation(fields: [subjectId], references: [id], onDelete: Restrict)
  creator     User             @relation(fields: [createdBy], references: [id], onDelete: Restrict)
  submissions AssignmentSubmission[]

  @@map("assignments")
  @@index([batchId])
}

model AssignmentSubmission {
  id           String     @id @default(uuid()) @db.Uuid
  assignmentId String     @db.Uuid
  studentId    String     @db.Uuid
  submittedAt  DateTime?
  marksAwarded Int?
  feedback     String?
  gradedBy     String?    @db.Uuid
  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student      Student    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  grader       User?      @relation(fields: [gradedBy], references: [id], onDelete: SetNull)

  @@unique([assignmentId, studentId])
  @@map("assignment_submissions")
}
```

### API Endpoints

| Method | Endpoint                                       | Role Access          | Description                        |
|--------|------------------------------------------------|----------------------|------------------------------------|
| GET    | `/api/assignments`                             | Admin, Faculty       | List assignments (filter by batch) |
| POST   | `/api/assignments`                             | Admin, Faculty       | Create assignment                  |
| PUT    | `/api/assignments/:id`                         | Admin, Faculty       | Edit assignment                    |
| PATCH  | `/api/assignments/:id/publish`                 | Admin, Faculty       | Publish to students                |
| GET    | `/api/assignments/:id/submissions`             | Admin, Faculty       | List all submissions               |
| POST   | `/api/assignments/:id/submit`                  | Student              | Student marks as submitted         |
| PATCH  | `/api/assignments/:id/grade/:studentId`        | Admin, Faculty       | Award marks + feedback             |

### Key Business Rules
- Only PUBLISHED assignments are visible to students
- Students can only see their own submission and marks
- Grading is only allowed once an assignment is CLOSED
- `marksAwarded` cannot exceed `maxMarks`

### Frontend Pages & Components

| File                                           | Description                           |
|------------------------------------------------|---------------------------------------|
| `pages/Assignments/AssignmentPage.jsx`         | List view for faculty/admin           |
| `pages/Assignments/AssignmentForm.jsx`         | Create / edit assignment              |
| `pages/Assignments/AssignmentSubmissions.jsx`  | Submission list with grading inline   |
| `components/AssignmentStatusBadge.jsx`         | DRAFT / PUBLISHED / CLOSED pill       |
| `services/assignmentService.js`                | All API calls                         |
