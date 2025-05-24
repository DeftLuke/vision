
'use server';
/**
 * @fileOverview An AI agent that generates HTML and Tailwind CSS code from a wireframe image.
 *
 * - generateCodeFromWireframe - A function that handles the code generation process from a wireframe.
 * - GenerateCodeFromWireframeInput - The input type for the generateCodeFromWireframe function.
 * - GenerateCodeFromWireframeOutput - The return type for the generateCodeFromWireframe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Reusing the same input/output schemas as generate-code-from-image for consistency
// as the core task (image -> code) is similar.
const GenerateCodeFromWireframeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a UI wireframe or sketch, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('Additional instructions or context for the wireframe conversion.'),
});
export type GenerateCodeFromWireframeInput = z.infer<typeof GenerateCodeFromWireframeInputSchema>;

const GenerateCodeFromWireframeOutputSchema = z.object({
  html: z.string().describe('The generated HTML code based on the wireframe.'),
  tailwindCss: z.string().describe('The generated Tailwind CSS code for styling.'),
  javaScript: z.string().optional().describe('The generated JavaScript code, if any, for interactions.'),
});
export type GenerateCodeFromWireframeOutput = z.infer<typeof GenerateCodeFromWireframeOutputSchema>;

export async function generateCodeFromWireframe(input: GenerateCodeFromWireframeInput): Promise<GenerateCodeFromWireframeOutput> {
  return generateCodeFromWireframeFlow(input);
}

const generateCodeFromWireframePrompt = ai.definePrompt({
  name: 'generateCodeFromWireframePrompt',
  input: {schema: GenerateCodeFromWireframeInputSchema},
  output: {schema: GenerateCodeFromWireframeOutputSchema},
  prompt: `You are an expert frontend developer specializing in converting UI wireframe sketches into clean, production-ready HTML and Tailwind CSS code.

Your task is to analyze the provided wireframe sketch and generate the corresponding HTML structure and Tailwind CSS classes.
Focus on capturing the layout, key elements (buttons, inputs, text areas, placeholders), and overall structure depicted in the sketch.
The output should be functional and visually representative of the wireframe.

Wireframe Sketch:
{{media url=photoDataUri}}

User's Additional Instructions (if any):
{{{prompt}}}

Output the HTML, Tailwind CSS, and JavaScript (if absolutely necessary for basic structure, otherwise omit) code snippets separately.

HTML:
<html goes here>

Tailwind CSS:
<tailwind css goes here>

JavaScript (Optional):
<javascript code goes here, if any>`,
});

const generateCodeFromWireframeFlow = ai.defineFlow(
  {
    name: 'generateCodeFromWireframeFlow',
    inputSchema: GenerateCodeFromWireframeInputSchema,
    outputSchema: GenerateCodeFromWireframeOutputSchema,
  },
  async input => {
    const {output} = await generateCodeFromWireframePrompt(input);
    return output!;
  }
);
