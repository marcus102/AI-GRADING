
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
  maxScore: z
    .number({
      required_error: "Max score is required.",
      invalid_type_error: "Max score must be a number.",
    })
    .nullable() // Allow null for initial empty input
    .refine(val => val !== null, { message: "Max score is required."}) // Ensure it's not null on submit
    .refine(val => val !== null && val >= 1, { message: "Max score must be at least 1." })
    .refine(val => val !== null && val <= 100, { message: "Max score can be at most 100." })
    .default(10),
});

export type GradingFormValues = z.infer<typeof gradingFormSchema>;

// Create a new type for validated data before sending to backend, ensuring maxScore is a number
export const validatedGradingFormSchema = gradingFormSchema.extend({
    maxScore: z.number().min(1).max(100)
});
export type ValidatedGradingFormValues = z.infer<typeof validatedGradingFormSchema>;


export const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export type AuthFormValues = z.infer<typeof authSchema>;

