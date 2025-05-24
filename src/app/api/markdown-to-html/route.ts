
import {NextRequest, NextResponse} from 'next/server';
import {convertMarkdownToHtml, MarkdownToHtmlInput, MarkdownToHtmlOutput} from '@/ai/flows/markdown-to-html-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { markdownText } = body as MarkdownToHtmlInput;

    if (!markdownText || typeof markdownText !== 'string' ) { // Allow empty markdown for preview of structure
      return NextResponse.json({ error: 'Missing or invalid markdownText' }, { status: 400 });
    }
    
    const result: MarkdownToHtmlOutput = await convertMarkdownToHtml({ markdownText });
    
    if (!result || !result.htmlContent) {
      console.error('AI did not return expected HTML content structure:', result);
      return NextResponse.json({ error: 'AI failed to convert Markdown to HTML.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/markdown-to-html:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to convert Markdown: ${errorMessage}` }, { status: 500 });
  }
}
