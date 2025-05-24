
import {NextRequest, NextResponse} from 'next/server';
import {getDesignFeedback, DesignFeedbackInput, DesignFeedbackOutput} from '@/ai/flows/design-feedback-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoDataUri, feedbackFocus } = body as DesignFeedbackInput;

    if (!photoDataUri || !photoDataUri.startsWith('data:image/') || !photoDataUri.includes(';base64,')) {
      return NextResponse.json({ error: 'Missing or invalid photoDataUri' }, { status: 400 });
    }
    // feedbackFocus is optional
    
    const result: DesignFeedbackOutput = await getDesignFeedback({ photoDataUri, feedbackFocus });
    
    if (!result || !result.feedbackText) {
      console.error('AI did not return expected design feedback structure:', result);
      return NextResponse.json({ error: 'AI failed to generate design feedback.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/design-feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to get design feedback: ${errorMessage}` }, { status: 500 });
  }
}
