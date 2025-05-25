
import {NextRequest, NextResponse} from 'next/server';
import {figmaToCode, FigmaToCodeInput, FigmaToCodeOutput, FigmaToCodeInputSchema} from '@/ai/flows/figma-to-code-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validatedInput = FigmaToCodeInputSchema.safeParse(body);
    if (!validatedInput.success) {
      return NextResponse.json({ error: 'Invalid input', details: validatedInput.error.format() }, { status: 400 });
    }
    const { figmaUrl, figmaFileDataUri, targetFramework } = validatedInput.data;

    if (!figmaUrl && !figmaFileDataUri) {
      return NextResponse.json({ error: 'Either figmaUrl or figmaFileDataUri must be provided' }, { status: 400 });
    }
    
    const input: FigmaToCodeInput = { targetFramework };
    if (figmaUrl) input.figmaUrl = figmaUrl;
    if (figmaFileDataUri) input.figmaFileDataUri = figmaFileDataUri;
    
    const result: FigmaToCodeOutput = await figmaToCode(input);
    
    if (!result || !result.generatedCode) {
      console.error('AI did not return expected Figma-to-code structure:', result);
      return NextResponse.json({ error: 'AI failed to generate code from Figma input.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/figma-to-code:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to convert Figma to code: ${errorMessage}` }, { status: 500 });
  }
}
