
import {NextRequest, NextResponse} from 'next/server';
import {codingChat, CodingChatInput, CodingChatOutput} from '@/ai/flows/coding-chat-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userMessage } = body as CodingChatInput;

    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid userMessage' }, { status: 400 });
    }
    
    // In a more advanced setup, you might pass chatHistory here as well
    const result: CodingChatOutput = await codingChat({ userMessage });
    
    if (!result || !result.assistantResponse) {
      console.error('AI did not return expected chat response structure:', result);
      return NextResponse.json({ error: 'AI failed to generate a response.' }, { status: 500 });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/coding-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to get chat response: ${errorMessage}` }, { status: 500 });
  }
}
