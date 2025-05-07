'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GradingFormValues, gradingFormSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileCheck, UploadCloud } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface GradingFormProps {
  onSubmit: (data: GradingFormValues) => Promise<void>;
  isLoading: boolean;
}

export function GradingForm({ onSubmit, isLoading }: GradingFormProps) {
  const form = useForm<GradingFormValues>({
    resolver: zodResolver(gradingFormSchema),
    defaultValues: {
      question: '',
      rubric: '',
      studentResponse: '',
    },
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <UploadCloud className="mr-2 h-6 w-6 text-primary" />
          Submit for Grading
        </CardTitle>
        <CardDescription>Enter the question, grading rubric, and the student's response.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Question</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the test question" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rubric"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Grading Rubric</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the grading criteria and rubric" {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studentResponse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Student's Response</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the student's answer" {...field} rows={8} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
