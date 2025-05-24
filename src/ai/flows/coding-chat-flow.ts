
'use server';
/**
 * @fileOverview An AI agent that provides live coding help.
 *
 * - codingChat - A function that handles coding questions.
 * - CodingChatInput - The input type for the codingChat function.
 * - CodingChatOutput - The return type for the codingChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodingChatInputSchema = z.object({
  userMessage: z.string().describe('The user’s coding-related question or problem description.'),
  // chatHistory: z.array(z.object({role: z.enum(['user', 'model']), parts: z.array(z.object({text: z.string()}))})).optional().describe("Previous conversation history, if any.")
});
export type CodingChatInput = z.infer<typeof CodingChatInputSchema>;

const CodingChatOutputSchema = z.object({
  assistantResponse: z.string().describe('The AI’s answer or assistance to the user’s query.'),
});
export type CodingChatOutput = z.infer<typeof CodingChatOutputSchema>;

export async function codingChat(input: CodingChatInput): Promise<CodingChatOutput> {
  return codingChatFlow(input);
}

// For a stateless Q&A, history is not directly managed in this simple flow.
// For stateful chat, the flow would need to incorporate and manage chatHistory.
const prompt = ai.definePrompt({
  name: 'codingChatPrompt',
  input: {schema: CodingChatInputSchema},
  output: {schema: CodingChatOutputSchema},
  prompt: `You are a friendly and highly skilled AI coding assistant.
Your goal is to help users with their programming questions, explain concepts, debug code, and provide best practice advice.
Be clear, concise, and provide code examples when helpful. Use markdown for code blocks.

User's question:
{{{userMessage}}}

Your response:`,
});

const codingChatFlow = ai.defineFlow(
  {
    name: 'codingChatFlow',
    inputSchema: CodingChatInputSchema,
    outputSchema: CodingChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
