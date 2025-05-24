
import {NextRequest, NextResponse} from 'next/server';
import {detectBugs, BugDetectorInput, BugDetectorOutput} from '@/ai/flows/bug-detector-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeToDebug, language } = body as BugDetectorInput;

    if (!codeToDebug || typeof codeToDebug !== 'string' || codeToDebug.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid codeToDebug' }, { status: 400 });
    }
    if (!language || typeof language !== 'string' || language.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid language' }, { status: 400 });
    }
    
    const result: BugDetectorOutput = await detectBugs({ codeToDebug, language });
    
    if (!result || !result.analysis) {
      console.error('AI did not return expected debug analysis structure:', result);
      return NextResponse.json({ error: 'AI failed to generate debug analysis.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/debug-code:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to debug code: ${errorMessage}` }, { status: 500 });
  }
}
