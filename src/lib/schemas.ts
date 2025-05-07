import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES_QUESTION = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];
const ACCEPTED_FILE_TYPES_RESPONSE = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
];

export const gradingFormSchema = z.object({
  questionFile: z
    .instanceof(File, { message: "Question file is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES_QUESTION.includes(file.type),
      ".pdf, .doc, .docx files are accepted for the question."
    ),
  rubric: z.string().min(20, { message: "Rubric must be at least 20 characters long." }),
  studentResponseFile: z
    .instanceof(File, { message: "Student response file is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES_RESPONSE.includes(file.type),
      ".pdf, .doc, .docx, .txt files are accepted for the student response."
    ),
});

export type GradingFormValues = z.infer<typeof gradingFormSchema>;
