
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { GradingForm } from '@/components/grading/GradingForm';
import { GradingResult } from '@/components/grading/GradingResult';
import { GradingFormValues } from '@/lib/schemas';
import { handleGradeSubmission } from '@/app/actions';
import type { GradeStudentResponseOutput } from '@/ai/flows/grade-student-response';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [aiGradingResult, setAiGradingResult] = useState<GradeStudentResponseOutput | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);


  const handleFormSubmit = async (data: GradingFormValues) => {
    setIsLoading(true);
    setAiGradingResult(null); // Clear previous results

    try {
      const questionFileContentDataUri = await fileToDataUrl(data.questionFile);
      const studentResponseFileContentDataUri = await fileToDataUrl(data.studentResponseFile);
      
      let expectedAnswerFileContentDataUri: string | undefined = undefined;
      if (data.expectedAnswerFile) {
        expectedAnswerFileContentDataUri = await fileToDataUrl(data.expectedAnswerFile);
      }

      const result = await handleGradeSubmission({
        questionFileContentDataUri,
        studentResponseFileContentDataUri,
        rubric: data.rubric,
        expectedAnswerFileContentDataUri,
      });

      setIsLoading(false);

      if (result.success && result.data) {
        setAiGradingResult(result.data);
        toast({
          title: "Grading Successful",
          description: "AI assessment has been completed.",
          variant: "default",
        });
      } else {
        toast({
          title: "Grading Error",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error processing files or grading:", error);
      toast({
        title: "File Processing Error",
        description: error instanceof Error ? error.message : "Could not process uploaded files.",
        variant: "destructive",
      });
    }
  };

  const handleFinalizeGrade = (finalGrade: { score: number; feedback: string; justification: string; instructorComments?: string }) => {
    setIsFinalizing(true);
    console.log("Final Grade Data (for export):", finalGrade);
    // In a real app, this would trigger an export or save to a database.
    setTimeout(() => { // Simulate API call
      toast({
        title: "Grade Finalized",
        description: "The grade and feedback have been logged (simulated export).",
      });
      setIsFinalizing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <GradingForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
          <div>
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-border rounded-lg h-full bg-card">
                <Spinner size="lg" />
                <p className="mt-4 text-lg text-muted-foreground">AI is grading, please wait...</p>
              </div>
            )}
            {!isLoading && aiGradingResult && (
              <GradingResult aiResult={aiGradingResult} onFinalize={handleFinalizeGrade} isFinalizing={isFinalizing}/>
            )}
            {!isLoading && !aiGradingResult && (
               <Alert className="bg-card shadow-md">
                 <Terminal className="h-5 w-5" />
                 <AlertTitle>Ready to Grade!</AlertTitle>
                 <AlertDescription>
                   Upload the question file, rubric, and student's response file on the left for AI-powered grading. You can also optionally provide an expected answer file. Results will appear here.
                 </AlertDescription>
               </Alert>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-4 border-t border-border text-sm text-muted-foreground">
        {currentYear !== null ? <p>&copy; {currentYear} GradeWise. AI-Powered Grading.</p> : <p>Loading footer...</p>}
      </footer>
    </div>
  );
}
