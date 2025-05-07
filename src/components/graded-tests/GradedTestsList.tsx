
'use client';

import type { StoredGradedTest } from '@/lib/types';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3, MessageSquare, FileText, FilePenLine, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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


interface GradedTestsListProps {
  tests: StoredGradedTest[];
  onDeleteTest: (testId: string) => void;
}

export function GradedTestsList({ tests, onDeleteTest }: GradedTestsListProps) {
  if (tests.length === 0) {
    return (
      <Card className="shadow-md border-dashed border-border">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4 text-gray-400" />
          <p className="text-xl font-semibold">No Graded Tests Found</p>
          <p>Once you grade tests, they will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tests.sort((a,b) => new Date(b.gradingDate).getTime() - new Date(a.gradingDate).getTime()).map((test) => (
        <Card key={test.id} className="shadow-lg overflow-hidden">
          <CardHeader className="bg-card">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Response: {test.studentResponseFileName}
                </CardTitle>
                <CardDescription>
                  Question: {test.questionFileName} | Graded on: {format(new Date(test.gradingDate), 'PPP p')}
                </CardDescription>
              </div>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Delete Test</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this graded test.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteTest(test.id)} className="bg-destructive hover:bg-destructive/90">
                      Yes, delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Rubric Summary</h4>
                <p className="text-sm truncate">{test.rubricSummary}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Final Score</h4>
                <Badge variant="default" className="text-lg px-3 py-1 bg-primary text-primary-foreground">{test.finalScore} / {test.maxScore}</Badge>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm hover:no-underline">View Full Grading Details</AccordionTrigger>
                <AccordionContent className="pt-2 text-sm">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center"><Star className="mr-2 h-4 w-4 text-accent" /> AI Score</h4>
                      <Badge variant="secondary" className="text-md">{test.aiScore} / {test.maxScore}</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center"><MessageSquare className="mr-2 h-4 w-4 text-primary" /> AI Feedback</h4>
                      <p className="p-2 bg-muted rounded-md whitespace-pre-wrap text-xs">{test.aiFeedback}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center"><FilePenLine className="mr-2 h-4 w-4 text-primary" /> AI Justification</h4>
                      <p className="p-2 bg-muted rounded-md whitespace-pre-wrap text-xs">{test.aiJustification}</p>
                    </div>
                    {test.instructorComments && (
                      <div>
                        <h4 className="font-semibold mb-1 flex items-center"><Edit3 className="mr-2 h-4 w-4 text-accent" /> Instructor Comments</h4>
                        <p className="p-2 bg-accent/10 border border-accent/30 rounded-md whitespace-pre-wrap text-xs">{test.instructorComments}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

