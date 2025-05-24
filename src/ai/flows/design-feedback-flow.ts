
'use server';
/**
 * @fileOverview An AI agent that provides UI/UX design feedback on images.
 *
 * - getDesignFeedback - A function that handles the design feedback process.
 * - DesignFeedbackInput - The input type for the getDesignFeedback function.
 * - DesignFeedbackOutput - The return type for the getDesignFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DesignFeedbackInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A UI screenshot or design image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  feedbackFocus: z.string().optional().describe('Specific areas to focus on for feedback (e.g., layout, color scheme, accessibility, UX flow). Default to overall feedback.'),
});
export type DesignFeedbackInput = z.infer<typeof DesignFeedbackInputSchema>;

const DesignFeedbackOutputSchema = z.object({
  feedbackText: z.string().describe('Constructive feedback on the UI design, formatted in Markdown.'),
});
export type DesignFeedbackOutput = z.infer<typeof DesignFeedbackOutputSchema>;

export async function getDesignFeedback(input: DesignFeedbackInput): Promise<DesignFeedbackOutput> {
  return designFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'designFeedbackPrompt',
  input: {schema: DesignFeedbackInputSchema},
  output: {schema: DesignFeedbackOutputSchema},
  prompt: `You are an expert UI/UX design critic with a keen eye for aesthetics, usability, and accessibility.
Your task is to analyze the provided UI design image and offer constructive, actionable feedback.
Format your feedback using Markdown for readability (e.g., use headings, bullet points).

Consider the following aspects in your review:
- Layout and Composition: Visual hierarchy, spacing, alignment, balance.
- Color Scheme: Harmony, contrast, accessibility for color-blind users.
- Typography: Readability, hierarchy, font choices.
- User Experience (UX): Intuitiveness, clarity, ease of navigation, information architecture.
- Accessibility (a11y): Contrast, target sizes, ARIA considerations (if inferable).
- Consistency: Uniformity of design elements.
- Visual Appeal: Overall aesthetics and modern design principles.

{{#if feedbackFocus}}
The user has specifically asked for feedback focusing on: **{{{feedbackFocus}}}**. Please prioritize this aspect in your review, but also provide a brief overall assessment.
{{else}}
Please provide a comprehensive review covering overall design, layout, color scheme, and user experience.
{{/if}}

UI Design Image:
{{media url=photoDataUri}}

Your Feedback (in Markdown format):
`,
});

const designFeedbackFlow = ai.defineFlow(
  {
    name: 'designFeedbackFlow',
    inputSchema: DesignFeedbackInputSchema,
    outputSchema: DesignFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
