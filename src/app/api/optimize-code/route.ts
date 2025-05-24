
import {NextRequest, NextResponse} from 'next/server';
import {optimizeCode, OptimizeCodeInput, OptimizeCodeOutput} from '@/ai/flows/optimize-code-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeToOptimize, language } = body as OptimizeCodeInput;

    if (!codeToOptimize || typeof codeToOptimize !== 'string' || codeToOptimize.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid codeToOptimize' }, { status: 400 });
    }
    if (!language || typeof language !== 'string' || language.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid language' }, { status: 400 });
    }
    
    const result: OptimizeCodeOutput = await optimizeCode({ codeToOptimize, language });
    
    if (!result || !result.optimizedCode) {
      console.error('AI did not return expected optimized code structure:', result);
      return NextResponse.json({ error: 'AI failed to generate optimized code.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/optimize-code:', error);
    let errorMessage = 'An unknown error occurred during code optimization.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({ error: `Failed to optimize code: ${errorMessage}` }, { status: 500 });
  }
}
