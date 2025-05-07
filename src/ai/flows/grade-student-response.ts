// use server'

/**
 * @fileOverview AI agent that grades student responses based on a predefined rubric.
 *
 * - gradeStudentResponse - A function that grades student responses.
 * - GradeStudentResponseInput - The input type for the gradeStudentResponse function.
 * - GradeStudentResponseOutput - The return type for the gradeStudentResponse function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeStudentResponseInputSchema = z.object({
  studentResponse: z.string().describe('The student response to be graded.'),
  rubric: z.string().describe('The grading rubric to be used for assessment.'),
  question: z.string().describe('The question the student is answering'),
});
export type GradeStudentResponseInput = z.infer<typeof GradeStudentResponseInputSchema>;

const GradeStudentResponseOutputSchema = z.object({
  score: z.number().describe('The score assigned to the student response.'),
  feedback: z.string().describe('Detailed feedback on the student response, highlighting strengths and areas for improvement.'),
  justification: z.string().describe('Explanation of how the score was derived based on the rubric.'),
});
export type GradeStudentResponseOutput = z.infer<typeof GradeStudentResponseOutputSchema>;

export async function gradeStudentResponse(input: GradeStudentResponseInput): Promise<GradeStudentResponseOutput> {
  return gradeStudentResponseFlow(input);
}

const gradeStudentResponsePrompt = ai.definePrompt({
  name: 'gradeStudentResponsePrompt',
  input: {schema: GradeStudentResponseInputSchema},
  output: {schema: GradeStudentResponseOutputSchema},
  prompt: `You are an AI grading assistant that assesses student responses based on a given rubric.\n\n  Question: {{{question}}}\n\n  Student Response: {{{studentResponse}}}\n\n  Rubric: {{{rubric}}}\n\n  Evaluate the student response based on the rubric and provide a score, detailed feedback, and a justification for the score. The score must be an integer.\n\n  Ensure that the feedback is constructive and helpful, guiding the student on how to improve their understanding and performance. The justification should clearly explain how the rubric was applied to arrive at the score.\n  Score is out of 10.
\n  Format your response as a JSON object.
  `,
});

const gradeStudentResponseFlow = ai.defineFlow(
  {
    name: 'gradeStudentResponseFlow',
    inputSchema: GradeStudentResponseInputSchema,
    outputSchema: GradeStudentResponseOutputSchema,
  },
  async input => {
    const {output} = await gradeStudentResponsePrompt(input);
    return output!;
  }
);
