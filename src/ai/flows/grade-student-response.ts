
'use server';

/**
 * @fileOverview AI agent that grades student responses based on a predefined rubric.
 *
 * - gradeStudentResponse - A function that grades student responses.
 * - GradeStudentResponseInput - The input type for the gradeStudentResponse function.
 * - GradeStudentResponseOutput - The return type for the gradeStudentResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeStudentResponseInputSchema = z.object({
  studentResponseText: z.string().describe("The plain text content of the student's response."),
  rubric: z.string().describe('The grading rubric to be used for assessment.'),
  questionText: z.string().describe("The plain text content of the test question."),
  expectedAnswerText: z.string().optional().describe("The plain text content of the expected answer, if provided by the lecturer."),
});
export type GradeStudentResponseInput = z.infer<typeof GradeStudentResponseInputSchema>;

const GradeStudentResponseOutputSchema = z.object({
  score: z.number().describe('The score assigned to the student response (out of 10).'),
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
  prompt: `You are an AI grading assistant that assesses student responses based on a given rubric.

  Question:
  {{{questionText}}}

  Student Response:
  {{{studentResponseText}}}

  Rubric:
  {{{rubric}}}

  {{#if expectedAnswerText}}
  Expected Answer (for reference, provided by the lecturer):
  {{{expectedAnswerText}}}
  {{/if}}

  Evaluate the student response based on the rubric (and the expected answer if provided as reference) and provide a score (out of 10), detailed feedback, and a justification for the score. The score must be an integer or a float with one decimal place (e.g., 7, 8.5).
  Ensure that the feedback is constructive and helpful, guiding the student on how to improve their understanding and performance. The justification should clearly explain how the rubric was applied to arrive at the score.
  
  Format your response as a JSON object.
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
    if (!output) {
      throw new Error('AI failed to generate a response.');
    }
    // Ensure score is a number, even if LLM returns it as string in JSON
    if (typeof output.score === 'string') {
      output.score = parseFloat(output.score);
    }
    return output;
  }
);
