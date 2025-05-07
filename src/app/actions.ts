'use server';

import { gradeStudentResponse, GradeStudentResponseInput, GradeStudentResponseOutput } from '@/ai/flows/grade-student-response';

interface ActionResult {
  success: boolean;
  data?: GradeStudentResponseOutput;
  error?: string;
}

export async function handleGradeSubmission(input: GradeStudentResponseInput): Promise<ActionResult> {
  try {
    const result = await gradeStudentResponse(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error grading submission:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during grading." };
  }
}
