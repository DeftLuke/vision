import {NextRequest, NextResponse} from 'next/server';
import {generateCodeFromImage, GenerateCodeFromImageInput, GenerateCodeFromImageOutput} from '@/ai/flows/generate-code-from-image';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoDataUri, prompt } = body as GenerateCodeFromImageInput;

    if (!photoDataUri) {
      return NextResponse.json({ error: 'Missing photoDataUri' }, { status: 400 });
    }
    if (!prompt) {
      // Provide a default prompt if none is given, or make it mandatory
      // For now, let's make it mandatory on the client, but API could default
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }
    
    // Basic validation for data URI format (optional, but good practice)
    if (!photoDataUri.startsWith('data:image/') || !photoDataUri.includes(';base64,')) {
        return NextResponse.json({ error: 'Invalid photoDataUri format' }, { status: 400 });
    }

    const result: GenerateCodeFromImageOutput = await generateCodeFromImage({ photoDataUri, prompt });
    
    // The AI flow is expected to return html and tailwindCss. JavaScript is optional.
    // If the AI function does not return these, it might indicate an issue with the AI model or prompt.
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
    // Check if it's a Genkit flow error, which might have more details
    // Example: if (error.details) errorMessage = error.details;
    
    return NextResponse.json({ error: `Failed to generate code: ${errorMessage}` }, { status: 500 });
  }
}
