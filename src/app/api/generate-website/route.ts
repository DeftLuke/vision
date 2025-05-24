
import {NextRequest, NextResponse} from 'next/server';
import {generateWebsite, GenerateWebsiteInput, GenerateWebsiteOutput} from '@/ai/flows/generate-website-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description } = body as GenerateWebsiteInput;

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid website description' }, { status: 400 });
    }
    
    const result: GenerateWebsiteOutput = await generateWebsite({ description });
    
    if (!result || !result.html || !result.tailwindCss) {
      console.error('AI did not return expected website structure:', result);
      return NextResponse.json({ error: 'AI failed to generate complete website structure.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/generate-website:', error);
    let errorMessage = 'An unknown error occurred during website generation.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({ error: `Failed to generate website: ${errorMessage}` }, { status: 500 });
  }
}
