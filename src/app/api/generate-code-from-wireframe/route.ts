
import {NextRequest, NextResponse} from 'next/server';
import {generateCodeFromWireframe, GenerateCodeFromWireframeInput, GenerateCodeFromWireframeOutput} from '@/ai/flows/generate-code-from-wireframe-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoDataUri, prompt } = body as GenerateCodeFromWireframeInput;

    if (!photoDataUri) {
      return NextResponse.json({ error: 'Missing photoDataUri for wireframe' }, { status: 400 });
    }
     if (!photoDataUri.startsWith('data:image/') || !photoDataUri.includes(';base64,')) {
        return NextResponse.json({ error: 'Invalid photoDataUri format for wireframe' }, { status: 400 });
    }
    // Prompt is optional, but if provided, should be a string
    if (prompt && typeof prompt !== 'string') {
        return NextResponse.json({ error: 'Invalid prompt format' }, { status: 400 });
    }
    
    const result: GenerateCodeFromWireframeOutput = await generateCodeFromWireframe({ photoDataUri, prompt: prompt || "Convert this wireframe sketch into clean HTML and Tailwind CSS." });
    
    if (!result || !result.html || !result.tailwindCss) {
      console.error('AI did not return expected code structure from wireframe:', result);
      return NextResponse.json({ error: 'AI failed to generate complete code structure from wireframe.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/generate-code-from-wireframe:', error);
    let errorMessage = 'An unknown error occurred during wireframe to code generation.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({ error: `Failed to generate code from wireframe: ${errorMessage}` }, { status: 500 });
  }
}
