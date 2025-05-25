
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
  width: z.number().optional().describe('Optional target width in pixels for the generated UI component/page.'),
  height: z.number().optional().describe('Optional target height in pixels for the generated UI component/page.'),
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
  prompt: `You are an expert frontend developer specializing in converting UI designs into clean, production-ready, responsive code using HTML and Tailwind CSS.

You will receive a UI image, a customization prompt, and optional target dimensions.
Based on the image and the prompt, generate the corresponding HTML structure, Tailwind CSS classes, and any necessary JavaScript code for interactions.

IMPORTANT:
- The generated code MUST be responsive and mobile-first. It should look good on all screen sizes, from small mobile devices to large desktops.
- Use Tailwind CSS utility classes extensively for all styling. Avoid custom CSS in <style> tags unless absolutely necessary for complex scenarios not covered by Tailwind.
{{#if width}}
- The user has suggested a target width of approximately {{{width}}}px. This dimension should be considered for a typical desktop viewport, but ensure the design scales gracefully for smaller and larger screens.
{{/if}}
{{#if height}}
- The user has suggested a target height of approximately {{{height}}}px. This dimension should be considered for a typical desktop viewport, but ensure the design scales gracefully.
{{/if}}
- Ensure the generated code is well-structured, semantic, and follows best practices for web development.
- Prioritize creating a layout that adapts fluidly to different screen sizes. Use responsive Tailwind prefixes (sm:, md:, lg:, xl:) as needed.

UI Image: {{media url=photoDataUri}}
Customization Prompt: {{{prompt}}}
{{#if width}}Target Width: ~{{{width}}}px (for desktop, ensure responsive){{/if}}
{{#if height}}Target Height: ~{{{height}}}px (for desktop, ensure responsive){{/if}}

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
