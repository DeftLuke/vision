
import {NextRequest, NextResponse} from 'next/server';
import {generateImageFromText, GenerateImageFromTextInput, GenerateImageFromTextOutput} from '@/ai/flows/generate-image-from-text';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body as GenerateImageFromTextInput;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid prompt' }, { status: 400 });
    }
    
    const result: GenerateImageFromTextOutput = await generateImageFromText({ prompt });
    
    if (!result || !result.imageDataUri) {
      console.error('AI did not return expected image data URI:', result);
      return NextResponse.json({ error: 'AI failed to generate image data.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/generate-image:', error);
    let errorMessage = 'An unknown error occurred during image generation.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({ error: `Failed to generate image: ${errorMessage}` }, { status: 500 });
  }
}
