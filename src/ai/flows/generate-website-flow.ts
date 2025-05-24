
'use server';
/**
 * @fileOverview An AI agent that generates a full website (HTML, Tailwind CSS, JS) from a text description.
 *
 * - generateWebsite - A function that handles the website generation process.
 * - GenerateWebsiteInput - The input type for the generateWebsite function.
 * - GenerateWebsiteOutput - The return type for the generateWebsite function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWebsiteInputSchema = z.object({
  description: z.string().describe('A detailed text description of the website to be generated.'),
  // Potentially add preferences like color scheme, sections, etc. in the future
});
export type GenerateWebsiteInput = z.infer<typeof GenerateWebsiteInputSchema>;

// Reusing the output schema from image-to-code as it fits the HTML/CSS/JS structure
const GenerateWebsiteOutputSchema = z.object({
  html: z.string().describe('The generated HTML code for the website.'),
  tailwindCss: z.string().describe('The generated Tailwind CSS code for styling.'),
  javaScript: z.string().optional().describe('The generated JavaScript code for interactions, if any.'),
});
export type GenerateWebsiteOutput = z.infer<typeof GenerateWebsiteOutputSchema>;

export async function generateWebsite(input: GenerateWebsiteInput): Promise<GenerateWebsiteOutput> {
  return generateWebsiteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWebsitePrompt',
  input: {schema: GenerateWebsiteInputSchema},
  output: {schema: GenerateWebsiteOutputSchema},
  prompt: `You are an AI website generator. Your task is to create a complete, modern, and responsive single-page website based on the user's description.
The website should use HTML, Tailwind CSS for styling, and JavaScript only if necessary for essential interactivity (e.g., mobile menu toggle, simple animations).
Ensure the code is well-structured, semantic, and production-ready. The output should be a fully functional webpage.

User's Website Description:
{{{description}}}

Output the HTML, Tailwind CSS, and JavaScript code snippets separately.
The HTML should be a complete document structure.
The Tailwind CSS should include all necessary styles, potentially including base styles or component definitions.

HTML:
<html goes here>

Tailwind CSS:
<tailwind css goes here>

JavaScript (Optional):
<javascript code goes here, if any>`,
});

const generateWebsiteFlow = ai.defineFlow(
  {
    name: 'generateWebsiteFlow',
    inputSchema: GenerateWebsiteInputSchema,
    outputSchema: GenerateWebsiteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
