
export interface StoredGradedTest {
  id: string; // Unique identifier, e.g., timestamp or UUID
  questionFileName: string; // Keep track of the original question file name
  studentResponseFileName: string; // Keep track of the original student response file name
  rubricSummary: string; // A short summary or the first few words of the rubric
  aiScore: number;
  aiFeedback: string;
  aiJustification: string;
  finalScore: number;
  instructorComments?: string;
  gradingDate: string; // ISO string format for date
}
