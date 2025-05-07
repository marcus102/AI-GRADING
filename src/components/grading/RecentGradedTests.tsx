
'use client';

import type { StoredGradedTest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface RecentGradedTestsProps {
  tests: StoredGradedTest[];
  maxToShow?: number;
}

export function RecentGradedTests({ tests, maxToShow = 5 }: RecentGradedTestsProps) {
  const recentTests = tests
    .sort((a, b) => new Date(b.gradingDate).getTime() - new Date(a.gradingDate).getTime())
    .slice(0, maxToShow);

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-2xl">
            <ListChecks className="mr-3 h-7 w-7 text-primary" />
            Recently Graded Tests
            </CardTitle>
        </div>
        <CardDescription>A quick overview of your latest {maxToShow} graded submissions. All tests are stored in your browser's local storage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTests.length > 0 ? (
            recentTests.map((test) => (
            <div key={test.id} className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow duration-150 ease-in-out">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex-grow">
                    <h4 className="font-semibold text-foreground truncate" title={test.studentResponseFileName}>
                    {test.studentResponseFileName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate" title={test.questionFileName}>
                    Question: {test.questionFileName}
                    </p>
                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0 flex-shrink-0">
                    <Badge variant="default" className="text-lg px-3 py-1 bg-primary text-primary-foreground">{test.finalScore} / {test.maxScore}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                    Graded: {format(new Date(test.gradingDate), 'MMM d, yyyy')}
                    </p>
                </div>
                </div>
            </div>
            ))
        ) : (
            <div className="flex flex-col items-center text-center text-muted-foreground py-6">
                <FileText className="h-12 w-12 mb-3 text-gray-400" />
                <p className="font-semibold">No tests have been graded yet.</p>
                <p className="text-sm">Your recent gradings will appear here.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

