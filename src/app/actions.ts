
'use server';

import path from 'node:path';
import type { GradeStudentResponseInput, GradeStudentResponseOutput } from '@/ai/flows/grade-student-response';
import { gradeStudentResponse } from '@/ai/flows/grade-student-response';
import mammoth from 'mammoth';
// Do not import pdf from 'pdf-parse' statically here. It will be imported dynamically.

// Singleton promise for pdf-parse instance to ensure options are set only once
let pdfParserPromise: Promise<any> | null = null;

async function getPdfParser() {
  if (!pdfParserPromise) {
    pdfParserPromise = (async () => {
      try {
        // Resolve paths to pdfjs-dist assets
        const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
        const cMapsPath = path.join(pdfjsDistPath, 'cmaps');
        const standardFontsPath = path.join(pdfjsDistPath, 'standard_fonts');

        // pdf.js in Node.js expects local file system paths for these
        // Ensure trailing separator as pdf.js might expect it
        const cMapUrl = cMapsPath + path.sep;
        const standardFontDataUrl = standardFontsPath + path.sep;

        const pdfJsOptions = JSON.stringify({
          cMapUrl: cMapUrl,
          cMapPacked: true, // Required for local CMaps
          standardFontDataUrl: standardFontDataUrl,
          disableFontFace: true, // Recommended for server-side environments
          useSystemFonts: false, // Avoids trying to access system fonts
        });
        
        process.env.PDF_JS_OPTIONS = pdfJsOptions;
        // console.log("Set PDF_JS_OPTIONS for pdf-parse:", process.env.PDF_JS_OPTIONS);
      } catch (e) {
        console.error("Error setting PDF_JS_OPTIONS for pdf-parse. PDF parsing may fail or be incorrect.", e);
        // If this fails, pdf-parse will use its default (likely broken) paths
      }

      // Dynamically import pdf-parse *after* setting the environment variable
      const pdfParseModule = await import('pdf-parse');
      return pdfParseModule.default;
    })();
  }
  return pdfParserPromise;
}


interface HandleGradeSubmissionActionInput {
  questionFileContentDataUri: string;
  studentResponseFileContentDataUri: string;
  rubric: string;
  expectedAnswerFileContentDataUri?: string;
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
      const pdf = await getPdfParser(); // Get the configured pdf-parse instance
      const data = await pdf(buffer);
      return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    } else if (mimeType === 'application/msword') {
      throw new Error('Unsupported MIME type for text extraction: .doc files are not supported. Please use .docx, .pdf, or .txt.');
    }
    throw new Error(`Unsupported MIME type for text extraction: ${mimeType}. Please use .docx, .pdf, or .txt.`);
  } catch (extractionError) {
    console.error(`Error extracting text from ${mimeType}:`, extractionError);
    const specificMessage = extractionError instanceof Error ? extractionError.message : String(extractionError);
    // Added more context to the error message
    throw new Error(`Failed to extract text from file (MIME type: ${mimeType}). Ensure the file is valid and not corrupted. Internal error: ${specificMessage}`);
  }
}

export async function handleGradeSubmission(input: HandleGradeSubmissionActionInput): Promise<ActionResult> {
  try {
    const questionText = await extractTextFromDataUri(input.questionFileContentDataUri);
    const studentResponseText = await extractTextFromDataUri(input.studentResponseFileContentDataUri);
    
    let expectedAnswerText: string | undefined = undefined;
    if (input.expectedAnswerFileContentDataUri) {
      expectedAnswerText = await extractTextFromDataUri(input.expectedAnswerFileContentDataUri);
    }

    const genkitInput: GradeStudentResponseInput = {
      questionText,
      studentResponseText,
      rubric: input.rubric,
      expectedAnswerText,
    };

    const result = await gradeStudentResponse(genkitInput);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error grading submission:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during grading." };
  }
}
