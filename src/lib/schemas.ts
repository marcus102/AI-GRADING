import { z } from 'zod';

export const gradingFormSchema = z.object({
  question: z.string().min(10, { message: "Question must be at least 10 characters long." }),
  rubric: z.string().min(20, { message: "Rubric must be at least 20 characters long." }),
  studentResponse: z.string().min(10, { message: "Student response must be at least 10 characters long." }),
});

export type GradingFormValues = z.infer<typeof gradingFormSchema>;
