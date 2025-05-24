
import {NextRequest, NextResponse} from 'next/server';
import {imageToText, ImageToTextInput, ImageToTextOutput} from '@/ai/flows/image-to-text-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoDataUri, taskType } = body as ImageToTextInput;

    if (!photoDataUri || !photoDataUri.startsWith('data:image/') || !photoDataUri.includes(';base64,')) {
      return NextResponse.json({ error: 'Missing or invalid photoDataUri' }, { status: 400 });
    }
    if (!taskType || (taskType !== 'ocr' && taskType !== 'caption')) {
      return NextResponse.json({ error: 'Invalid taskType. Must be "ocr" or "caption".' }, { status: 400 });
    }
    
    const result: ImageToTextOutput = await imageToText({ photoDataUri, taskType });
    
    if (!result || typeof result.text !== 'string') {
      console.error('AI did not return expected text structure:', result);
      return NextResponse.json({ error: 'AI failed to process the image.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/image-to-text:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to process image: ${errorMessage}` }, { status: 500 });
  }
}
