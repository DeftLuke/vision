'use server';
/**
 * @fileOverview A code customization AI agent.
 *
 * - customizeCodeGeneration - A function that handles the code customization process.
 * - CustomizeCodeGenerationInput - The input type for the customizeCodeGeneration function.
 * - CustomizeCodeGenerationOutput - The return type for the customizeCodeGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeCodeGenerationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a UI screenshot or design image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('Prompt to customize code generation (e.g., generate responsive navigation bar).'),
});
export type CustomizeCodeGenerationInput = z.infer<typeof CustomizeCodeGenerationInputSchema>;

const CustomizeCodeGenerationOutputSchema = z.object({
  code: z.string().describe('The generated code (HTML + Tailwind CSS + JavaScript).'),
});
export type CustomizeCodeGenerationOutput = z.infer<typeof CustomizeCodeGenerationOutputSchema>;

export async function customizeCodeGeneration(input: CustomizeCodeGenerationInput): Promise<CustomizeCodeGenerationOutput> {
  return customizeCodeGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customizeCodeGenerationPrompt',
  input: {schema: CustomizeCodeGenerationInputSchema},
  output: {schema: CustomizeCodeGenerationOutputSchema},
  prompt: `You are an expert frontend developer specializing in generating code from UI screenshots or design images.

You will use this information to generate clean, production-ready frontend code (HTML + Tailwind CSS + JavaScript).

Always use Tailwind CSS for styling.

User Prompt: {{{prompt}}}

Here is the UI screenshot or design image:
{{media url=photoDataUri}}`,
});

const customizeCodeGenerationFlow = ai.defineFlow(
  {
    name: 'customizeCodeGenerationFlow',
    inputSchema: CustomizeCodeGenerationInputSchema,
    outputSchema: CustomizeCodeGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
