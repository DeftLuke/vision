
'use server';
/**
 * @fileOverview An AI agent that detects bugs in code and suggests fixes.
 *
 * - detectBugs - A function that handles bug detection.
 * - BugDetectorInput - The input type for the detectBugs function.
 * - BugDetectorOutput - The return type for the detectBugs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BugDetectorInputSchema = z.object({
  codeToDebug: z.string().describe('The code snippet to be analyzed for bugs.'),
  language: z.string().describe('The programming language of the code (e.g., JavaScript, Python, TypeScript).'),
});
export type BugDetectorInput = z.infer<typeof BugDetectorInputSchema>;

const BugDetectorOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of bugs found, including explanations and suggested fixes. If no bugs, a confirmation.'),
});
export type BugDetectorOutput = z.infer<typeof BugDetectorOutputSchema>;

export async function detectBugs(input: BugDetectorInput): Promise<BugDetectorOutput> {
  return bugDetectorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bugDetectorPrompt',
  input: {schema: BugDetectorInputSchema},
  output: {schema: BugDetectorOutputSchema},
  prompt: `You are an expert AI code debugger.
Your task is to meticulously analyze the following {{{language}}} code for bugs, errors, and potential issues.
For each issue found:
1. Clearly identify the problematic code.
2. Explain why it's an issue.
3. Provide a corrected version of the code or a detailed suggestion for fixing it.
Format your response using markdown, with code blocks for original and corrected code.

If no bugs are found, state that the code appears to be correct and briefly explain why.

Language: {{{language}}}
Code to Debug:
\`\`\`{{{language}}}
{{{codeToDebug}}}
\`\`\`

Your Analysis:`,
});

const bugDetectorFlow = ai.defineFlow(
  {
    name: 'bugDetectorFlow',
    inputSchema: BugDetectorInputSchema,
    outputSchema: BugDetectorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
