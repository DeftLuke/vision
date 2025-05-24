
import {NextRequest, NextResponse} from 'next/server';
import {explainCode, ExplainCodeInput, ExplainCodeOutput} from '@/ai/flows/explain-code-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeToExplain } = body as ExplainCodeInput;

    if (!codeToExplain || typeof codeToExplain !== 'string' || codeToExplain.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid codeToExplain' }, { status: 400 });
    }
    
    const result: ExplainCodeOutput = await explainCode({ codeToExplain });
    
    if (!result || !result.explanation) {
      console.error('AI did not return expected explanation structure:', result);
      return NextResponse.json({ error: 'AI failed to generate code explanation.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/explain-code:', error);
    let errorMessage = 'An unknown error occurred during code explanation.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({ error: `Failed to explain code: ${errorMessage}` }, { status: 500 });
  }
}
