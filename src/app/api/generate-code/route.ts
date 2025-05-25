
import {NextRequest, NextResponse} from 'next/server';
import {generateCodeFromImage, GenerateCodeFromImageInput, GenerateCodeFromImageOutput} from '@/ai/flows/generate-code-from-image';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoDataUri, prompt, width, height } = body as GenerateCodeFromImageInput & { width?: number, height?: number };

    if (!photoDataUri) {
      return NextResponse.json({ error: 'Missing photoDataUri' }, { status: 400 });
    }
    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }
    
    if (!photoDataUri.startsWith('data:image/') || !photoDataUri.includes(';base64,')) {
        return NextResponse.json({ error: 'Invalid photoDataUri format' }, { status: 400 });
    }

    const input: GenerateCodeFromImageInput = { photoDataUri, prompt };
    if (width !== undefined && !isNaN(width)) {
      input.width = Number(width);
    }
    if (height !== undefined && !isNaN(height)) {
      input.height = Number(height);
    }

    const result: GenerateCodeFromImageOutput = await generateCodeFromImage(input);
    
    if (!result || !result.html || !result.tailwindCss) {
      console.error('AI did not return expected code structure:', result);
      return NextResponse.json({ error: 'AI failed to generate complete code structure.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/generate-code:', error);
    let errorMessage = 'An unknown error occurred during code generation.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({ error: `Failed to generate code: ${errorMessage}` }, { status: 500 });
  }
}
