
'use server';
/**
 * @fileOverview An AI agent that extracts text (OCR) or generates captions from images.
 *
 * - imageToText - A function that handles text extraction or captioning.
 * - ImageToTextInput - The input type for the imageToText function.
 * - ImageToTextOutput - The return type for the imageToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageToTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo or screenshot, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  taskType: z.enum(['ocr', 'caption']).describe("Specify 'ocr' to extract text or 'caption' to generate a caption for the image."),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

const ImageToTextOutputSchema = z.object({
  text: z.string().describe('The extracted text (for OCR) or the generated caption (for captioning).'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;

export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
  return imageToTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageToTextPrompt',
  input: {schema: ImageToTextInputSchema},
  output: {schema: ImageToTextOutputSchema},
  prompt: `You are an AI assistant specialized in image analysis.
{{#if (eq taskType "ocr")}}
Task: Extract all readable text from the provided image.
Respond with only the extracted text. If no text is found, state 'No text found in image'.
{{else}}
Task: Generate a concise and descriptive caption for the provided image.
Respond with only the caption.
{{/if}}

Image:
{{media url=photoDataUri}}`,
});

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
