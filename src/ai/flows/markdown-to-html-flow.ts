
'use server';
/**
 * @fileOverview An AI agent that converts Markdown text to a styled HTML page.
 *
 * - convertMarkdownToHtml - A function that handles the Markdown to HTML conversion.
 * - MarkdownToHtmlInput - The input type for the convertMarkdownToHtml function.
 * - MarkdownToHtmlOutput - The return type for the convertMarkdownToHtml function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarkdownToHtmlInputSchema = z.object({
  markdownText: z.string().describe('The Markdown content to be converted to HTML.'),
});
export type MarkdownToHtmlInput = z.infer<typeof MarkdownToHtmlInputSchema>;

const MarkdownToHtmlOutputSchema = z.object({
  htmlContent: z.string().describe('The generated HTML content as a single, complete HTML document string, styled with Tailwind CSS.'),
});
export type MarkdownToHtmlOutput = z.infer<typeof MarkdownToHtmlOutputSchema>;

export async function convertMarkdownToHtml(input: MarkdownToHtmlInput): Promise<MarkdownToHtmlOutput> {
  return markdownToHtmlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'markdownToHtmlPrompt',
  input: {schema: MarkdownToHtmlInputSchema},
  output: {schema: MarkdownToHtmlOutputSchema},
  prompt: `You are an expert web developer specializing in Markdown to HTML conversion.
Your task is to convert the provided Markdown text into a single, complete, and responsive HTML page.
The HTML page MUST be styled using Tailwind CSS classes directly within the HTML elements.
The output MUST be a full HTML document string, including:
- \`<!DOCTYPE html>\`
- \`<html>\` tag with \`lang="en"\`
- \`<head>\` section containing:
  - \`<meta charset="UTF-8">\`
  - \`<meta name="viewport" content="width=device-width, initial-scale=1.0">\`
  - \`<title>Markdown Content Preview</title>\`
  - A \`<script src="https://cdn.tailwindcss.com"></script>\` tag to load Tailwind CSS for previewing.
- \`<body>\` tag containing the converted Markdown content.

Ensure common Markdown elements (headings, paragraphs, lists, code blocks, blockquotes, links, images) are correctly converted and styled appropriately with Tailwind CSS.
For code blocks, use a simple pre/code structure with basic Tailwind styling for readability (e.g., background, padding, font).

Markdown Text to Convert:
\`\`\`markdown
{{{markdownText}}}
\`\`\`

Generated HTML Page:
`,
});

const markdownToHtmlFlow = ai.defineFlow(
  {
    name: 'markdownToHtmlFlow',
    inputSchema: MarkdownToHtmlInputSchema,
    outputSchema: MarkdownToHtmlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the output is a single string block for the HTML
    if (output && typeof output.htmlContent === 'string') {
        // Basic cleanup: remove potential backticks if AI wraps the HTML in a markdown code block
        let html = output.htmlContent;
        const htmlBlockRegex = /^```(?:html)?\s*([\s\S]*?)\s*```$/;
        const match = htmlBlockRegex.exec(html.trim());
        if (match && match[1]) {
          html = match[1].trim();
        }
        return { htmlContent: html };
    }
    return output!;
  }
);
