
'use client';

import type { StoredGradedTest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks, FileText, Star, MessageSquare, FilePenLine, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RecentGradedTestsProps {
  tests: StoredGradedTest[];
}

export function RecentGradedTests({ tests }: RecentGradedTestsProps) {
  const sortedTests = tests.sort((a, b) => new Date(b.gradingDate).getTime() - new Date(a.gradingDate).getTime());

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-2xl">
            <ListChecks className="mr-3 h-7 w-7 text-primary" />
            Graded Test History
            </CardTitle>
        </div>
        <CardDescription>A history of your graded submissions. All tests are stored in your browser's local storage and are specific to your logged-in account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedTests.length > 0 ? (
            sortedTests.map((test) => (
            <Card key={test.id} className="shadow-md overflow-hidden bg-card border border-border">
                <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex-grow">
                            <h4 className="font-semibold text-foreground truncate text-lg" title={test.studentResponseFileName}>
                            <FileText className="inline-block mr-2 h-5 w-5 text-primary align-text-bottom" />
                            {test.studentResponseFileName}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate" title={test.questionFileName}>
                            Question: {test.questionFileName}
                            </p>
                        </div>
                        <div className="text-left sm:text-right mt-2 sm:mt-0 flex-shrink-0">
                            <Badge variant="default" className="text-lg px-3 py-1 bg-primary text-primary-foreground">{test.finalScore} / {test.maxScore}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                            Graded: {format(new Date(test.gradingDate), 'MMM d, yyyy, p')}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4 px-4">
                    <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`details-${test.id}`} className="border-b-0">
                        <AccordionTrigger className="text-sm hover:no-underline py-2 text-primary">View Grading Details</AccordionTrigger>
                        <AccordionContent className="pt-2 text-sm space-y-3">
                             <div>
                                <h5 className="font-semibold mb-1 text-xs text-muted-foreground flex items-center"><Star className="mr-1.5 h-3.5 w-3.5 text-accent" /> AI Score</h5>
                                <Badge variant="secondary" className="text-sm">{test.aiScore} / {test.maxScore}</Badge>
                            </div>
                            <div>
                                <h5 className="font-semibold mb-1 text-xs text-muted-foreground flex items-center"><MessageSquare className="mr-1.5 h-3.5 w-3.5 text-primary" /> AI Feedback</h5>
                                <p className="p-2 bg-muted rounded-md whitespace-pre-wrap text-xs">{test.aiFeedback}</p>
                            </div>
                            <div>
                                <h5 className="font-semibold mb-1 text-xs text-muted-foreground flex items-center"><FilePenLine className="mr-1.5 h-3.5 w-3.5 text-primary" /> AI Justification</h5>
                                <p className="p-2 bg-muted rounded-md whitespace-pre-wrap text-xs">{test.aiJustification}</p>
                            </div>
                            {test.instructorComments && (
                            <div>
                                <h5 className="font-semibold mb-1 text-xs text-muted-foreground flex items-center"><Edit3 className="mr-1.5 h-3.5 w-3.5 text-accent" /> Instructor Comments</h5>
                                <p className="p-2 bg-accent/10 border border-accent/30 rounded-md whitespace-pre-wrap text-xs">{test.instructorComments}</p>
                            </div>
                            )}
                             <div className="mt-2">
                                <h5 className="font-semibold mb-1 text-xs text-muted-foreground">Rubric Used (Summary)</h5>
                                <p className="text-xs p-2 bg-muted rounded-md italic">{test.rubricSummary}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
            ))
        ) : (
            <div className="flex flex-col items-center text-center text-muted-foreground py-8">
                <FileText className="h-16 w-16 mb-4 text-gray-400" />
                <p className="font-semibold text-lg">No tests have been graded yet for this account.</p>
                <p className="text-sm">Your graded submissions will appear here once you grade them.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

