
'use server';

import { gradeStudentResponse, GradeStudentResponseInput, GradeStudentResponseOutput } from '@/ai/flows/grade-student-response';
import mammoth from 'mammoth';
import pdf from 'pdf-parse'; // pdf-parse is a default export

interface HandleGradeSubmissionActionInput {
  questionFileContentDataUri: string;
  studentResponseFileContentDataUri: string;
  rubric: string;
}

interface ActionResult {
  success: boolean;
  data?: GradeStudentResponseOutput;
  error?: string;
}

async function extractTextFromDataUri(dataUri: string): Promise<string> {
  const [meta, base64Data] = dataUri.split(',');
  if (!meta || !base64Data) {
    throw new Error('Invalid data URI format');
  }

  const mimeTypeMatch = meta.match(/^data:(.+);base64$/);
  if (!mimeTypeMatch || !mimeTypeMatch[1]) {
    throw new Error('Could not extract MIME type from data URI');
  }
  const mimeType = mimeTypeMatch[1];
  const buffer = Buffer.from(base64Data, 'base64');

  try {
    if (mimeType === 'text/plain') {
      return buffer.toString('utf-8');
    } else if (mimeType === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    } else if (mimeType === 'application/msword') {
      // .doc files are generally not supported well by modern libraries like mammoth.
      throw new Error('Unsupported MIME type for text extraction: .doc files are not supported. Please use .docx, .pdf, or .txt.');
    }
    throw new Error(`Unsupported MIME type for text extraction: ${mimeType}. Please use .docx, .pdf, or .txt.`);
  } catch (extractionError) {
    console.error(`Error extracting text from ${mimeType}:`, extractionError);
    throw new Error(`Failed to extract text from file (${mimeType}). Ensure the file is not corrupted and is a supported format.`);
  }
}

export async function handleGradeSubmission(input: HandleGradeSubmissionActionInput): Promise<ActionResult> {
  try {
    const questionText = await extractTextFromDataUri(input.questionFileContentDataUri);
    const studentResponseText = await extractTextFromDataUri(input.studentResponseFileContentDataUri);

    const genkitInput: GradeStudentResponseInput = {
      questionText,
      studentResponseText,
      rubric: input.rubric,
    };

    const result = await gradeStudentResponse(genkitInput);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error grading submission:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during grading." };
  }
}
