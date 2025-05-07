
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { GradedTestsList } from '@/components/graded-tests/GradedTestsList';
import type { StoredGradedTest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function GradedTestsPage() {
  const [gradedList, setGradedList] = useState<StoredGradedTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    try {
      const storedData = localStorage.getItem('gradedBrokerTests');
      if (storedData) {
        setGradedList(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load graded tests from localStorage", error);
      toast({
        title: "Loading Error",
        description: "Could not load graded tests from local storage.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleClearAllTests = () => {
    try {
      localStorage.removeItem('gradedBrokerTests');
      setGradedList([]);
      toast({
        title: "Storage Cleared",
        description: "All graded tests have been removed from local storage.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to clear localStorage", error);
      toast({
        title: "Clearing Error",
        description: "Could not clear graded tests from local storage.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteTest = (testId: string) => {
    try {
      const updatedTests = gradedList.filter(test => test.id !== testId);
      localStorage.setItem('gradedBrokerTests', JSON.stringify(updatedTests));
      setGradedList(updatedTests);
      toast({
        title: "Test Deleted",
        description: "The selected test has been removed.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to delete test from localStorage", error);
      toast({
        title: "Deletion Error",
        description: "Could not delete the test from local storage.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-foreground flex items-center">
            <FileText className="mr-3 h-8 w-8 text-primary" />
            Stored Graded Tests
          </h2>
          {gradedList.length > 0 && (
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Clear All Tests
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all
                    stored graded tests from your browser's local storage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllTests} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-center py-10">Loading graded tests...</p>
        ) : (
          <GradedTestsList tests={gradedList} onDeleteTest={handleDeleteTest} />
        )}
      </main>
      <footer className="text-center py-4 border-t border-border text-sm text-muted-foreground">
        {currentYear !== null ? <p>&copy; {currentYear} GradeWise. AI-Powered Grading.</p> : <p>Loading footer...</p>}
      </footer>
    </div>
  );
}
