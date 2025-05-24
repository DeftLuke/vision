
import {NextRequest, NextResponse} from 'next/server';
import {generateReactComponent, GenerateReactComponentInput, GenerateReactComponentOutput} from '@/ai/flows/generate-react-component-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description } = body as GenerateReactComponentInput;

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid component description' }, { status: 400 });
    }
    
    const result: GenerateReactComponentOutput = await generateReactComponent({ description });
    
    if (!result || !result.componentCode) {
      console.error('AI did not return expected React component structure:', result);
      return NextResponse.json({ error: 'AI failed to generate React component.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/generate-react-component:', error);
    let errorMessage = 'An unknown error occurred during React component generation.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({ error: `Failed to generate React component: ${errorMessage}` }, { status: 500 });
  }
}
