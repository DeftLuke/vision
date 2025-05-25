
import {NextRequest, NextResponse} from 'next/server';
import {buildApiFromNl, BuildApiFromNlInput, BuildApiFromNlOutput, BuildApiFromNlInputSchema} from '@/ai/flows/natural-language-api-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedInput = BuildApiFromNlInputSchema.safeParse(body);
    if (!validatedInput.success) {
      return NextResponse.json({ error: 'Invalid input', details: validatedInput.error.format() }, { status: 400 });
    }
    const { description, targetFramework } = validatedInput.data;
    
    const result: BuildApiFromNlOutput = await buildApiFromNl({ description, targetFramework });
    
    if (!result || !result.generatedFiles) {
      console.error('AI did not return expected API structure:', result);
      return NextResponse.json({ error: 'AI failed to generate API code.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/natural-language-api:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to build API from natural language: ${errorMessage}` }, { status: 500 });
  }
}
