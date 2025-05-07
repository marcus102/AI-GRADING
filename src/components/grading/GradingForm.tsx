
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GradingFormValues, gradingFormSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileCheck, UploadCloud, Paperclip, FileText, AlertCircle, BookOpenCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';

interface GradingFormProps {
  onSubmit: (data: GradingFormValues) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_RUBRIC = `General Grading Rubric:

1.  **Accuracy and Correctness (40%)**:
    *   Are the facts, figures, and concepts presented accurate?
    *   Is the information up-to-date and relevant to the question?
    *   Are there any misinterpretations or errors in the response?

2.  **Completeness and Thoroughness (30%)**:
    *   Does the response address all parts of the question?
    *   Is the answer comprehensive and detailed?
    *   Are key concepts and ideas fully explored?

3.  **Clarity and Organization (20%)**:
    *   Is the response well-organized and easy to follow?
    *   Is the language clear, concise, and precise?
    *   Are there any grammatical errors or typos?

4.  **Critical Thinking and Analysis (10%)**:
    *   Does the response demonstrate critical thinking and analytical skills?
    *   Are arguments well-supported with evidence or examples?
    *   Does the student provide any original insights or perspectives?

Specific points to consider for this question:
- [Add specific criteria related to the question here]
- [Another specific criterion]

Score will be calculated based on the weighted average of the above criteria.
`;

export function GradingForm({ onSubmit, isLoading }: GradingFormProps) {
  const [questionFileName, setQuestionFileName] = useState<string | null>(null);
  const [responseFileName, setResponseFileName] = useState<string | null>(null);
  const [expectedAnswerFileName, setExpectedAnswerFileName] = useState<string | null>(null);

  const form = useForm<GradingFormValues>({
    resolver: zodResolver(gradingFormSchema),
    defaultValues: {
      rubric: DEFAULT_RUBRIC,
      questionFile: undefined,
      studentResponseFile: undefined,
      expectedAnswerFile: undefined,
      maxScore: 10, // Default max score
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldChange: (file: File | null) => void,
    setFileName: (name: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      fieldChange(file);
      setFileName(file.name);
    } else {
      fieldChange(null);
      setFileName(null);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <UploadCloud className="mr-2 h-6 w-6 text-primary" />
          Submit for Grading
        </CardTitle>
        <CardDescription>Upload the question, grading rubric, student's response, and optionally, the expected answer. Set the maximum score.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="questionFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Question File (PDF/DOCX)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => handleFileChange(e, field.onChange, setQuestionFileName)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      data-testid="question-file-input"
                    />
                  </FormControl>
                  {questionFileName && (
                    <div className="mt-2 text-sm text-muted-foreground flex items-center">
                      <Paperclip className="h-4 w-4 mr-2 shrink-0" />
                      Selected: {questionFileName}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rubric"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg flex items-center">
                     <BookOpenCheck className="mr-2 h-5 w-5 text-primary" />
                    Grading Rubric
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the grading criteria and rubric (max 5000 characters)" {...field} rows={8} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maxScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Maximum Score</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 10, 20, 100" 
                      {...field} 
                      onChange={e => {
                        const value = e.target.value;
                        field.onChange(value === '' ? null : parseInt(value, 10));
                      }}
                      min="1"
                      max="100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="studentResponseFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Student's Response File (PDF/DOCX/TXT)</FormLabel>
                  <FormControl>
                     <Input
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={(e) => handleFileChange(e, field.onChange, setResponseFileName)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      data-testid="student-response-file-input"
                    />
                  </FormControl>
                  {responseFileName && (
                    <div className="mt-2 text-sm text-muted-foreground flex items-center">
                      <Paperclip className="h-4 w-4 mr-2 shrink-0" />
                      Selected: {responseFileName}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedAnswerFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                    Expected Answer File (Optional - PDF/DOCX/TXT)
                  </FormLabel>
                  <FormControl>
                     <Input
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={(e) => handleFileChange(e, field.onChange, setExpectedAnswerFileName)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      data-testid="expected-answer-file-input"
                    />
                  </FormControl>
                  {expectedAnswerFileName && (
                    <div className="mt-2 text-sm text-muted-foreground flex items-center">
                      <Paperclip className="h-4 w-4 mr-2 shrink-0" />
                      Selected: {expectedAnswerFileName}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.formState.errors.root && (
              <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{form.formState.errors.root.message}</p>
              </div>
            )}


            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" /> Grading...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-5 w-5" /> Grade with AI
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

