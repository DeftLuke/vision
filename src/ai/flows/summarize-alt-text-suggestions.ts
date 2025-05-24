'use server';

/**
 * @fileOverview A flow that suggests alt text for images in generated code to improve accessibility.
 *
 * - summarizeAltTextSuggestions - A function that handles the alt text suggestion process.
 * - SummarizeAltTextSuggestionsInput - The input type for the summarizeAltTextSuggestions function.
 * - SummarizeAltTextSuggestionsOutput - The return type for the summarizeAltTextSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAltTextSuggestionsInputSchema = z.object({
  htmlCode: z.string().describe('The HTML code containing image elements.'),
});
export type SummarizeAltTextSuggestionsInput = z.infer<typeof SummarizeAltTextSuggestionsInputSchema>;

const SummarizeAltTextSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      imageSrc: z.string().describe('The src attribute of the image.'),
      altTextSuggestion: z.string().describe('The suggested alt text for the image.'),
    })
  ).describe('An array of alt text suggestions for images in the HTML code.'),
});
export type SummarizeAltTextSuggestionsOutput = z.infer<typeof SummarizeAltTextSuggestionsOutputSchema>;

export async function summarizeAltTextSuggestions(
  input: SummarizeAltTextSuggestionsInput
): Promise<SummarizeAltTextSuggestionsOutput> {
  return summarizeAltTextSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAltTextSuggestionsPrompt',
  input: {schema: SummarizeAltTextSuggestionsInputSchema},
  output: {schema: SummarizeAltTextSuggestionsOutputSchema},
  prompt: `You are an AI assistant that suggests alt text for images in HTML code to improve accessibility.\n\n  Given the following HTML code, analyze the images and suggest appropriate alt text for each one.\n  The alt text should be descriptive and concise, providing context for users who cannot see the image.\n\n  HTML Code:\n  {{{htmlCode}}}\n\n  Please provide your suggestions in the following JSON format:\n  {
    "suggestions": [
      {
        "imageSrc": "[image source URL]",
        "altTextSuggestion": "[suggested alt text]"
      }
    ]
  }`,
});

const summarizeAltTextSuggestionsFlow = ai.defineFlow(
  {
    name: 'summarizeAltTextSuggestionsFlow',
    inputSchema: SummarizeAltTextSuggestionsInputSchema,
    outputSchema: SummarizeAltTextSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
