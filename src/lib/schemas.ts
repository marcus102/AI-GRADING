
import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES_QUESTION = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
];
const ACCEPTED_FILE_TYPES_RESPONSE_OR_EXPECTED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain" // .txt
];

export const gradingFormSchema = z.object({
  questionFile: z
    .instanceof(File, { message: "Question file is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES_QUESTION.includes(file.type),
      "Only .pdf and .docx files are accepted for the question."
    ),
  rubric: z.string().min(20, { message: "Rubric must be at least 20 characters long." }).max(5000, {message: "Rubric must be at most 5000 characters long."}),
  studentResponseFile: z
    .instanceof(File, { message: "Student response file is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES_RESPONSE_OR_EXPECTED.includes(file.type),
      "Only .pdf, .docx, and .txt files are accepted for the student response."
    ),
  expectedAnswerFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES_RESPONSE_OR_EXPECTED.includes(file.type),
      "Only .pdf, .docx, and .txt files are accepted for the expected answer."
    ),
});

export type GradingFormValues = z.infer<typeof gradingFormSchema>;

