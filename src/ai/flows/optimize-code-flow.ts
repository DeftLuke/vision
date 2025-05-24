
'use server';
/**
 * @fileOverview An AI agent that optimizes and refactors code.
 *
 * - optimizeCode - A function that handles the code optimization process.
 * - OptimizeCodeInput - The input type for the optimizeCode function.
 * - OptimizeCodeOutput - The return type for the optimizeCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeCodeInputSchema = z.object({
  codeToOptimize: z.string().describe('The code snippet to be optimized or refactored.'),
  language: z.string().describe('The programming language of the code (e.g., JavaScript, TypeScript, Python).'),
});
export type OptimizeCodeInput = z.infer<typeof OptimizeCodeInputSchema>;

const OptimizeCodeOutputSchema = z.object({
  optimizedCode: z.string().describe('The optimized or refactored code.'),
});
export type OptimizeCodeOutput = z.infer<typeof OptimizeCodeOutputSchema>;

export async function optimizeCode(input: OptimizeCodeInput): Promise<OptimizeCodeOutput> {
  return optimizeCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeCodePrompt',
  input: {schema: OptimizeCodeInputSchema},
  output: {schema: OptimizeCodeOutputSchema},
  prompt: `You are an AI expert in code optimization and refactoring.
Your task is to refactor the following {{{language}}} code to be more efficient, readable, and maintainable.
Identify areas for improvement in terms of performance, clarity, and best practices.
Provide only the refactored code block as output.

Original {{{language}}} Code:
\`\`\`{{{language}}}
{{{codeToOptimize}}}
\`\`\`

Refactored {{{language}}} Code:
`,
});

const optimizeCodeFlow = ai.defineFlow(
  {
    name: 'optimizeCodeFlow',
    inputSchema: OptimizeCodeInputSchema,
    outputSchema: OptimizeCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
