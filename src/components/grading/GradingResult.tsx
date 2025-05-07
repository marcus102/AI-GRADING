'use client';

import type { GradeStudentResponseOutput } from '@/ai/flows/grade-student-response';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Edit3, CheckCircle, MessageSquare, FilePenLine, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GradingResultProps {
  aiResult: GradeStudentResponseOutput;
  onFinalize: (finalGrade: { score: number; feedback: string; justification: string; instructorComments?: string }) => void;
  isFinalizing: boolean;
}

export function GradingResult({ aiResult, onFinalize, isFinalizing }: GradingResultProps) {
  const [overriddenScore, setOverriddenScore] = useState<number | string>(aiResult.score);
  const [instructorComments, setInstructorComments] = useState<string>('');

  useEffect(() => {
    setOverriddenScore(aiResult.score);
    setInstructorComments(''); // Reset comments when new AI result comes
  }, [aiResult]);

  const handleFinalize = () => {
    const finalScore = typeof overriddenScore === 'string' ? parseFloat(overriddenScore) : overriddenScore;
    if (isNaN(finalScore)) {
      // Handle error, perhaps with a toast
      console.error("Invalid score format");
      return;
    }
    onFinalize({
      score: finalScore,
      feedback: aiResult.feedback,
      justification: aiResult.justification,
      instructorComments: instructorComments || undefined,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
          Grading Assessment
        </CardTitle>
        <CardDescription>Review the AI's assessment and make adjustments if necessary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Star className="mr-2 h-5 w-5 text-accent" />
            AI Score
          </h3>
          <Badge variant="default" className="text-2xl px-4 py-2 bg-accent text-accent-foreground">{aiResult.score} / 10</Badge>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            AI Feedback
          </h3>
          <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">{aiResult.feedback}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <FilePenLine className="mr-2 h-5 w-5 text-primary" />
            AI Justification
          </h3>
          <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">{aiResult.justification}</p>
        </div>

        <hr className="my-6" />

        <div className="space-y-4 p-4 border border-accent/50 rounded-lg bg-accent/5 shadow-sm">
          <h3 className="text-xl font-semibold mb-2 flex items-center text-accent">
            <Edit3 className="mr-2 h-5 w-5" />
            Instructor Review
          </h3>
          <div className="space-y-2">
            <Label htmlFor="overriddenScore" className="text-md">Override Score (out of 10)</Label>
            <Input
              id="overriddenScore"
              type="number"
              value={overriddenScore}
              onChange={(e) => setOverriddenScore(e.target.value === '' ? '' : parseFloat(e.target.value))}
              min="0"
              max="10"
              step="0.5"
              className="max-w-xs focus:ring-accent focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructorComments" className="text-md">Additional Comments (Optional)</Label>
            <Textarea
              id="instructorComments"
              placeholder="Add your comments or adjustments here..."
              value={instructorComments}
              onChange={(e) => setInstructorComments(e.target.value)}
              rows={4}
              className="focus:ring-accent focus:border-accent"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleFinalize} className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isFinalizing}>
          {isFinalizing ? 'Finalizing...' : 'Finalize & Export Grade'}
        </Button>
      </CardFooter>
    </Card>
  );
}
