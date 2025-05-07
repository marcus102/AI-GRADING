'use server';

/**
 * @fileOverview Provides a rationale for the AI's grading, explaining its reasoning and highlighting key points.
 *
 * - explainGradingRationale - A function that generates the grading rationale.
 * - ExplainGradingRationaleInput - The input type for the explainGradingRationale function.
 * - ExplainGradingRationaleOutput - The return type for the explainGradingRationale function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainGradingRationaleInputSchema = z.object({
  studentResponse: z
    .string()
    .describe('The student response to the test question.'),
  expectedAnswer: z.string().describe('The expected answer to the test question.'),
  assignedGrade: z.number().describe('The grade assigned to the student response.'),
  gradingRubric: z.string().describe('The rubric used for grading the response.'),
});

export type ExplainGradingRationaleInput = z.infer<
  typeof ExplainGradingRationaleInputSchema
>;

const ExplainGradingRationaleOutputSchema = z.object({
  rationale: z
    .string()
    .describe('The AI rationale for the assigned grade, including key points.'),
});

export type ExplainGradingRationaleOutput = z.infer<
  typeof ExplainGradingRationaleOutputSchema
>;

export async function explainGradingRationale(
  input: ExplainGradingRationaleInput
): Promise<ExplainGradingRationaleOutput> {
  return explainGradingRationaleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainGradingRationalePrompt',
  input: {schema: ExplainGradingRationaleInputSchema},
  output: {schema: ExplainGradingRationaleOutputSchema},
  prompt: `You are an AI assistant that provides a rationale for a given grade.

  Given the student response, the expected answer, the assigned grade, and the grading rubric, explain the reasoning behind the assigned grade. Highlight the key points in the student's response that led to the assigned grade.

  Student Response: {{{studentResponse}}}
  Expected Answer: {{{expectedAnswer}}}
  Assigned Grade: {{{assignedGrade}}}
  Grading Rubric: {{{gradingRubric}}}

  Provide a clear and concise rationale for the grade.`,
});

const explainGradingRationaleFlow = ai.defineFlow(
  {
    name: 'explainGradingRationaleFlow',
    inputSchema: ExplainGradingRationaleInputSchema,
    outputSchema: ExplainGradingRationaleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
