
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { GradingForm } from '@/components/grading/GradingForm';
import { GradingResult } from '@/components/grading/GradingResult';
import type { GradingFormValues, ValidatedGradingFormValues } from '@/lib/schemas';
import { gradingFormSchema } from '@/lib/schemas'; // Import the schema for validation
import { handleGradeSubmission } from '@/app/actions';
import type { GradeStudentResponseOutput } from '@/ai/flows/grade-student-response';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { StoredGradedTest } from '@/lib/types';

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
  const [currentFormValues, setCurrentFormValues] = useState<ValidatedGradingFormValues | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);


  const handleFormSubmit = async (data: GradingFormValues) => {
    setIsLoading(true);
    setAiGradingResult(null); 

    // Validate with Zod before processing, ensuring maxScore is a number
    const validationResult = gradingFormSchema.safeParse(data);
    if (!validationResult.success) {
      setIsLoading(false);
      // Attempt to show specific Zod error, or a generic one
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Invalid Input",
        description: firstError ? `${firstError.path.join('.')} - ${firstError.message}` : "Please check your form inputs.",
        variant: "destructive",
      });
      return;
    }
    
    const validatedData = validationResult.data as ValidatedGradingFormValues; // Now maxScore is guaranteed to be a number
    setCurrentFormValues(validatedData); // Store validated form values

    try {
      const questionFileContentDataUri = await fileToDataUrl(validatedData.questionFile);
      const studentResponseFileContentDataUri = await fileToDataUrl(validatedData.studentResponseFile);
      
      let expectedAnswerFileContentDataUri: string | undefined = undefined;
      if (validatedData.expectedAnswerFile) {
        expectedAnswerFileContentDataUri = await fileToDataUrl(validatedData.expectedAnswerFile);
      }

      const result = await handleGradeSubmission({
        questionFileContentDataUri,
        studentResponseFileContentDataUri,
        rubric: validatedData.rubric,
        maxScore: validatedData.maxScore, // Use validated maxScore
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

  const handleFinalGradeData = (finalGrade: { score: number; feedback: string; justification: string; instructorComments?: string }) => {
    if (!aiGradingResult || !currentFormValues) {
      toast({
        title: "Error Saving Grade",
        description: "Could not save the grade. Missing AI result or form data.",
        variant: "destructive",
      });
      return;
    }

    const newGradedTest: StoredGradedTest = {
      id: new Date().toISOString() + Math.random().toString(36).substring(2, 15), // Simple unique ID
      questionFileName: currentFormValues.questionFile.name,
      studentResponseFileName: currentFormValues.studentResponseFile.name,
      rubricSummary: currentFormValues.rubric.substring(0, 50) + (currentFormValues.rubric.length > 50 ? '...' : ''),
      aiScore: aiGradingResult.score,
      aiFeedback: aiGradingResult.feedback,
      aiJustification: aiGradingResult.justification,
      finalScore: finalGrade.score,
      maxScore: currentFormValues.maxScore, // Store maxScore
      instructorComments: finalGrade.instructorComments,
      gradingDate: new Date().toISOString(),
    };

    try {
      const existingTestsJSON = localStorage.getItem('gradedBrokerTests');
      const existingTests: StoredGradedTest[] = existingTestsJSON ? JSON.parse(existingTestsJSON) : [];
      existingTests.push(newGradedTest);
      localStorage.setItem('gradedBrokerTests', JSON.stringify(existingTests));
      console.log("Final Grade Data Saved to localStorage:", newGradedTest);
      // PDF export toast is handled within GradingResult
    } catch (e) {
      console.error("Failed to save to localStorage", e);
      toast({
        title: "Storage Error",
        description: "Could not save the graded test to local storage. It might be full or disabled.",
        variant: "destructive",
      });
    }
  };

  const handleStartOver = () => {
    setAiGradingResult(null);
    setCurrentFormValues(null);
    setIsLoading(false); 
    // Form fields in GradingForm will persist, user can change them or re-upload.
    // This primarily clears the results display.
    toast({
      title: "Ready for New Submission",
      description: "The previous grading result has been cleared.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 p-6 bg-card rounded-lg shadow-md border border-border">
          <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center">
            <Info className="mr-3 h-6 w-6 text-primary" />
            About This System
          </h2>
          <p className="text-muted-foreground text-base">
            This Hybrid Human-AI Grading System leverages artificial intelligence to assist lecturers in grading student test responses. 
            Lecturers can upload question files (PDF/DOCX), corresponding student responses (PDF/DOCX/TXT), 
            a grading rubric, and set a maximum score for the question. Optionally, an expected answer file can be provided for more accurate AI assessment.
            The system then provides an AI-generated score, feedback, and justification, which the lecturer can review, override, and add comments to before finalizing.
            This is a project-driven initiative aimed at streamlining the grading process while maintaining instructor oversight.
          </p>
        </div>

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
            {!isLoading && aiGradingResult && currentFormValues && (
              <GradingResult 
                aiResult={aiGradingResult} 
                maxScore={currentFormValues.maxScore}
                onFinalize={handleFinalGradeData} 
                isFinalizing={isFinalizing}
                onStartOver={handleStartOver}
              />
            )}
            {!isLoading && !aiGradingResult && (
               <Alert className="bg-card shadow-md">
                 <Terminal className="h-5 w-5" />
                 <AlertTitle>Ready to Grade!</AlertTitle>
                 <AlertDescription>
                   Upload the question file, rubric, student's response file, and set the maximum score on the left for AI-powered grading. You can also optionally provide an expected answer file. Results will appear here.
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

