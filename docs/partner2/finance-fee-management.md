# Finance & Fee Management — Partner 2

## Modules Overview

| Module              | Description                                                     |
|---------------------|-----------------------------------------------------------------|
| Fee Structures      | Define fee templates per course (one-time, recurring, custom)   |
| Installments        | Split fee into payment schedules with due dates                 |
| Scholarships        | Award percentage or fixed discounts to specific students        |
| Discounts           | Apply global or batch-level discount rules                      |
| Fee Collection      | Record actual payments against installments                     |
| Receipt Generation  | Generate a printable/downloadable payment receipt               |
| Due Fee Tracking    | Identify and report students with overdue installments          |

---

## Database Schema

```prisma
enum FeeFrequency {
  ONE_TIME
  MONTHLY
  QUARTERLY
  ANNUALLY
  CUSTOM
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  CHEQUE
  ONLINE
  UPI
}

enum PaymentStatus {
  PENDING
  PAID
  PARTIALLY_PAID
  OVERDUE
  WAIVED
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

// --- Fee Structure ---
model FeeStructure {
  id             String       @id @default(uuid()) @db.Uuid
  name           String
  courseId       String       @db.Uuid
  totalAmount    Decimal      @db.Decimal(10, 2)
  frequency      FeeFrequency @default(ONE_TIME)
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  course         Course       @relation(fields: [courseId], references: [id], onDelete: Restrict)
  installments   FeeInstallment[]
  studentFees    StudentFee[]

  @@map("fee_structures")
  @@index([courseId])
}

// --- Installment Schedule ---
model FeeInstallment {
  id              String       @id @default(uuid()) @db.Uuid
  feeStructureId  String       @db.Uuid
  installmentNo   Int
  label           String       // e.g. "Term 1", "Month 1"
  amount          Decimal      @db.Decimal(10, 2)
  dueDate         DateTime     @db.Date
  feeStructure    FeeStructure @relation(fields: [feeStructureId], references: [id], onDelete: Cascade)
  payments        FeePayment[]

  @@unique([feeStructureId, installmentNo])
  @@map("fee_installments")
}

// --- Assigned Fee per Student ---
model StudentFee {
  id             String       @id @default(uuid()) @db.Uuid
  studentId      String       @db.Uuid
  feeStructureId String       @db.Uuid
  discountId     String?      @db.Uuid
  scholarshipId  String?      @db.Uuid
  netPayable     Decimal      @db.Decimal(10, 2)
  createdAt      DateTime     @default(now())
  student        Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  feeStructure   FeeStructure @relation(fields: [feeStructureId], references: [id], onDelete: Restrict)
  discount       Discount?    @relation(fields: [discountId], references: [id], onDelete: SetNull)
  scholarship    Scholarship? @relation(fields: [scholarshipId], references: [id], onDelete: SetNull)
  payments       FeePayment[]

  @@unique([studentId, feeStructureId])
  @@map("student_fees")
}

// --- Payment Records ---
model FeePayment {
  id              String        @id @default(uuid()) @db.Uuid
  studentFeeId    String        @db.Uuid
  installmentId   String?       @db.Uuid
  amountPaid      Decimal       @db.Decimal(10, 2)
  paymentMethod   PaymentMethod
  paymentDate     DateTime      @default(now())
  status          PaymentStatus @default(PAID)
  transactionRef  String?
  collectedBy     String        @db.Uuid
  receiptNumber   String        @unique
  remarks         String?
  studentFee      StudentFee    @relation(fields: [studentFeeId], references: [id], onDelete: Restrict)
  installment     FeeInstallment? @relation(fields: [installmentId], references: [id], onDelete: SetNull)
  collector       User          @relation(fields: [collectedBy], references: [id], onDelete: Restrict)

  @@map("fee_payments")
  @@index([studentFeeId])
  @@index([paymentDate])
}

// --- Discounts (batch/course-level rules) ---
model Discount {
  id           String       @id @default(uuid()) @db.Uuid
  name         String
  type         DiscountType
  value        Decimal      @db.Decimal(10, 2)  // % or flat amount
  courseId     String?      @db.Uuid
  isActive     Boolean      @default(true)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  course       Course?      @relation(fields: [courseId], references: [id], onDelete: SetNull)
  studentFees  StudentFee[]

  @@map("discounts")
}

// --- Scholarships (per-student awards) ---
model Scholarship {
  id          String       @id @default(uuid()) @db.Uuid
  name        String
  type        DiscountType
  value       Decimal      @db.Decimal(10, 2)
  criteria    String?
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  studentFees StudentFee[]

  @@map("scholarships")
}
```

---

## API Endpoints

### Fee Structures

| Method | Endpoint                        | Role Access | Description                            |
|--------|---------------------------------|-------------|----------------------------------------|
| GET    | `/api/fees/structures`          | Admin       | List all fee structures                |
| POST   | `/api/fees/structures`          | Admin       | Create a fee structure                 |
| GET    | `/api/fees/structures/:id`      | Admin       | Get structure with installments        |
| PUT    | `/api/fees/structures/:id`      | Admin       | Update a fee structure                 |
| DELETE | `/api/fees/structures/:id`      | Admin       | Soft delete (isActive = false)         |

### Installments

| Method | Endpoint                                         | Role Access | Description                        |
|--------|--------------------------------------------------|-------------|------------------------------------|
| POST   | `/api/fees/structures/:id/installments`          | Admin       | Add installment to a structure     |
| PUT    | `/api/fees/installments/:id`                     | Admin       | Edit installment amount/date       |
| DELETE | `/api/fees/installments/:id`                     | Admin       | Remove an installment              |

### Student Fee Assignment

| Method | Endpoint                             | Role Access     | Description                          |
|--------|--------------------------------------|-----------------|--------------------------------------|
| POST   | `/api/fees/assign`                   | Admin           | Assign fee structure to a student    |
| GET    | `/api/fees/student/:studentId`       | Admin, Student  | Get student's fee + payment summary  |
| PATCH  | `/api/fees/student/:id/discount`     | Admin           | Apply or change discount             |
| PATCH  | `/api/fees/student/:id/scholarship`  | Admin           | Apply or change scholarship          |

### Fee Collection

| Method | Endpoint                 | Role Access | Description                            |
|--------|--------------------------|-------------|----------------------------------------|
| POST   | `/api/fees/collect`      | Admin       | Record a payment, generate receipt no. |
| GET    | `/api/fees/payments`     | Admin       | List payments (filter by date/student) |
| GET    | `/api/fees/receipt/:id`  | Admin, Student | Get receipt data for a payment       |

### Due Fee Tracking

| Method | Endpoint                     | Role Access | Description                              |
|--------|------------------------------|-------------|------------------------------------------|
| GET    | `/api/fees/due`              | Admin       | List all overdue students (with amounts) |
| GET    | `/api/fees/due/:studentId`   | Admin, Student | Overdue installments for one student  |

### Discounts & Scholarships

| Method | Endpoint                    | Role Access | Description                   |
|--------|-----------------------------|-------------|-------------------------------|
| GET    | `/api/fees/discounts`       | Admin       | List all discount rules       |
| POST   | `/api/fees/discounts`       | Admin       | Create a discount rule        |
| PUT    | `/api/fees/discounts/:id`   | Admin       | Edit a discount rule          |
| GET    | `/api/fees/scholarships`    | Admin       | List all scholarships         |
| POST   | `/api/fees/scholarships`    | Admin       | Create a scholarship          |
| PUT    | `/api/fees/scholarships/:id`| Admin       | Edit a scholarship            |

---

## Key Business Rules

### Fee Calculation
```
netPayable = totalAmount
           - discountAmount (if PERCENTAGE: totalAmount * value/100, if FIXED: value)
           - scholarshipAmount (same logic)
```
`netPayable` must never be negative. Floor at 0.

### Receipt Number Generation
Format: `RCP-<YEAR>-<5-digit-sequence>` e.g. `RCP-2026-00042`.
Sequence is global (not per student), stored as the `receiptNumber` unique field on `FeePayment`.

### Payment Status Rules
- When `amountPaid` fully covers the installment amount → `PAID`
- When `amountPaid` is less than installment amount → `PARTIALLY_PAID`
- When `dueDate` has passed and installment is not fully paid → `OVERDUE` (computed, not stored)
- Admin can manually set status to `WAIVED`

### Installment Totals
Sum of all `FeeInstallment.amount` for a structure must equal `FeeStructure.totalAmount`. Validate this at API level before saving.

---

## Frontend Pages & Components

| File                                          | Description                               |
|-----------------------------------------------|-------------------------------------------|
| `pages/Fees/FeeStructurePage.jsx`             | List + manage fee structures              |
| `pages/Fees/FeeStructureForm.jsx`             | Create / edit structure + installments    |
| `pages/Fees/FeeCollectionPage.jsx`            | Collect payment form                      |
| `pages/Fees/StudentFeePage.jsx`               | Student fee summary + history             |
| `pages/Fees/DueFeePage.jsx`                   | Overdue students list with filter         |
| `pages/Fees/ReceiptPage.jsx`                  | Printable receipt view                    |
| `pages/Fees/DiscountPage.jsx`                 | Manage discount and scholarship rules     |
| `components/FeePaymentBadge.jsx`              | Status badge: PAID / OVERDUE / PENDING    |
| `components/ReceiptCard.jsx`                  | Printable receipt card layout             |
| `components/InstallmentTimeline.jsx`          | Visual timeline of installment due dates  |
| `services/feeService.js`                      | All API calls for fee module              |

---

## Receipt Data Structure (for print view)

```json
{
  "receiptNumber": "RCP-2026-00042",
  "student": { "name": "...", "rollNumber": "...", "course": "..." },
  "payment": {
    "amountPaid": 5000,
    "paymentMethod": "CASH",
    "paymentDate": "2026-06-05",
    "transactionRef": null
  },
  "installment": { "label": "Term 1", "amount": 5000, "dueDate": "2026-06-01" },
  "collectedBy": "Admin Name",
  "issuedAt": "2026-06-05T10:30:00Z"
}
```
