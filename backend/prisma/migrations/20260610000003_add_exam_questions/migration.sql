CREATE TABLE "exam_questions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "examId" UUID NOT NULL,
  "questionId" UUID NOT NULL,
  CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "exam_questions_examId_questionId_key" UNIQUE ("examId", "questionId"),
  CONSTRAINT "exam_questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "exam_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question_bank"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
