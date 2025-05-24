'use server';
/**
 * @fileOverview An AI agent that generates HTML and Tailwind CSS code from an image of a UI.
 *
 * - generateCodeFromImage - A function that handles the code generation process.
 * - GenerateCodeFromImageInput - The input type for the generateCodeFromImage function.
 * - GenerateCodeFromImageOutput - The return type for the generateCodeFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a UI, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The prompt to customize code generation.'),
});
export type GenerateCodeFromImageInput = z.infer<typeof GenerateCodeFromImageInputSchema>;

const GenerateCodeFromImageOutputSchema = z.object({
  html: z.string().describe('The generated HTML code.'),
  tailwindCss: z.string().describe('The generated Tailwind CSS code.'),
  javaScript: z.string().optional().describe('The generated JavaScript code, if any.'),
});
export type GenerateCodeFromImageOutput = z.infer<typeof GenerateCodeFromImageOutputSchema>;

export async function generateCodeFromImage(input: GenerateCodeFromImageInput): Promise<GenerateCodeFromImageOutput> {
  return generateCodeFromImageFlow(input);
}

const generateCodeFromImagePrompt = ai.definePrompt({
  name: 'generateCodeFromImagePrompt',
  input: {schema: GenerateCodeFromImageInputSchema},
  output: {schema: GenerateCodeFromImageOutputSchema},
  prompt: `You are an expert frontend developer specializing in converting UI designs into clean, production-ready code using HTML and Tailwind CSS.

You will receive a UI image and a prompt to customize the code generation.
Based on the image and the prompt, you will generate the corresponding HTML structure, Tailwind CSS classes, and any necessary JavaScript code for interactions.

Ensure the generated code is well-structured, semantic, and follows best practices for web development.

UI Image: {{media url=photoDataUri}}
Prompt: {{{prompt}}}

Output the HTML, Tailwind CSS, and JavaScript code snippets separately.

HTML:
<html goes here>

Tailwind CSS:
<tailwind css goes here>

JavaScript (Optional):
<javascript code goes here, if any>`,
});

const generateCodeFromImageFlow = ai.defineFlow(
  {
    name: 'generateCodeFromImageFlow',
    inputSchema: GenerateCodeFromImageInputSchema,
    outputSchema: GenerateCodeFromImageOutputSchema,
  },
  async input => {
    const {output} = await generateCodeFromImagePrompt(input);
    return output!;
  }
);
