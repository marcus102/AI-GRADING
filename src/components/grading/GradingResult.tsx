
'use client';

import type { GradeStudentResponseOutput } from '@/ai/flows/grade-student-response';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Edit3, CheckCircle, MessageSquare, FilePenLine, Star, Download, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';


interface GradingResultProps {
  aiResult: GradeStudentResponseOutput;
  maxScore: number;
  onFinalize: (finalGrade: { score: number; feedback: string; justification: string; instructorComments?: string }) => void;
  isFinalizing: boolean; // Prop to indicate external finalization process
  onStartOver: () => void;
}

export function GradingResult({ aiResult, maxScore, onFinalize, isFinalizing: isExternallyFinalizing, onStartOver }: GradingResultProps) {
  const [overriddenScore, setOverriddenScore] = useState<number | string>(aiResult.score);
  const [instructorComments, setInstructorComments] = useState<string>('');
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const exportableContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setOverriddenScore(aiResult.score);
    setInstructorComments(''); 
  }, [aiResult]);

  const handleFinalizeAndExport = async () => {
    const finalScore = typeof overriddenScore === 'string' ? parseFloat(overriddenScore) : overriddenScore;
    if (isNaN(finalScore) || finalScore < 0 || finalScore > maxScore) {
      toast({
        title: "Invalid Score",
        description: `Please enter a valid score between 0 and ${maxScore}.`,
        variant: "destructive",
      });
      return;
    }

    onFinalize({
      score: finalScore,
      feedback: aiResult.feedback,
      justification: aiResult.justification,
      instructorComments: instructorComments || undefined,
    });

    if (exportableContentRef.current) {
      setIsPdfExporting(true);
      try {
        const canvas = await html2canvas(exportableContentRef.current, {
          scale: 2, 
          useCORS: true,
          logging: false, 
          windowWidth: exportableContentRef.current.scrollWidth,
          windowHeight: exportableContentRef.current.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); 

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const aspectRatio = canvasWidth / canvasHeight;

        let imgWidth = pdfWidth - 20; 
        let imgHeight = imgWidth / aspectRatio;

        if (imgHeight > pdfHeight - 20) { 
          imgHeight = pdfHeight - 20;
          imgWidth = imgHeight * aspectRatio;
        }
        
        const xOffset = (pdfWidth - imgWidth) / 2;
        const yOffset = 10; 

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        pdf.save('grading_result.pdf');

        toast({
          title: "Export Successful",
          description: "Grading result has been exported as PDF.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: "PDF Export Error",
          description: `Could not generate PDF. ${error instanceof Error ? error.message : 'Unknown error.'}`,
          variant: "destructive",
        });
      } finally {
        setIsPdfExporting(false);
      }
    } else {
      toast({
        title: "PDF Export Error",
        description: "Content to export not found. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const isBusy = isExternallyFinalizing || isPdfExporting;

  return (
    <Card className="shadow-lg">
      <div ref={exportableContentRef}> {/* Moved ref here to wrap only content meant for PDF */}
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
            Grading Assessment
          </CardTitle>
          <CardDescription>Review the AI's assessment and make adjustments if necessary. Then export the result.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Star className="mr-2 h-5 w-5 text-accent" />
              AI Score
            </h3>
            <Badge variant="default" className="text-2xl px-4 py-2 bg-accent text-accent-foreground">{aiResult.score} / {maxScore}</Badge>
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
              Instructor Review &amp; Override
            </h3>
            <div className="space-y-2">
              <Label htmlFor="overriddenScore" className="text-md">Override Score (0-{maxScore})</Label>
              <Input
                id="overriddenScore"
                type="number"
                value={overriddenScore}
                onChange={(e) => setOverriddenScore(e.target.value === '' ? '' : parseFloat(e.target.value))}
                min="0"
                max={maxScore}
                step="0.1" 
                className="max-w-xs focus:ring-accent focus:border-accent"
                disabled={isBusy}
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
                disabled={isBusy}
              />
            </div>
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6"> {/* Added pt-6 for spacing, default is pt-0 */}
        <Button onClick={handleFinalizeAndExport} className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={isBusy}>
          {isPdfExporting ? (
            <>
              <Spinner size="sm" className="mr-2" /> Exporting PDF...
            </>
          ) : isExternallyFinalizing ? (
             <>
              <Spinner size="sm" className="mr-2" /> Finalizing...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" /> Finalize &amp; Export PDF
            </>
          )}
        </Button>
        <Button onClick={onStartOver} variant="outline" className="w-full sm:flex-1" disabled={isBusy}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </CardFooter>
    </Card>
  );
}

