'use server';
/**
 * @fileOverview An AI agent that converts Figma designs (file or URL) to code.
 *
 * - figmaToCode - A function that handles the Figma to code conversion.
 * - FigmaToCodeInput - The input type for the figmaToCode function.
 * - FigmaToCodeOutput - The return type for the figmaToCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const FigmaToCodeInputSchema = z.object({
  figmaUrl: z.string().optional().describe('URL of the Figma design file or frame.'),
  figmaFileDataUri: z.string().optional().describe("A .fig file as a data URI. Expected format: 'data:application/octet-stream;base64,<encoded_data>'."),
  targetFramework: z.enum(['react-nextjs-tailwind', 'html-tailwind']).describe('The desired output code framework.'),
  // Add other customization options if needed, e.g., specific components to generate.
});
export type FigmaToCodeInput = z.infer<typeof FigmaToCodeInputSchema>;

export const FigmaToCodeOutputSchema = z.object({
  generatedCode: z.array(z.object({
    fileName: z.string().describe('The name of the generated file (e.g., component.tsx, page.html).'),
    language: z.string().describe('The language of the code (e.g., tsx, html, css).'),
    code: z.string().describe('The generated code content.'),
  })).describe('An array of generated code files.'),
  previewUrl: z.string().optional().describe('A URL to a live preview if available (e.g., if deployed to a sandbox).'),
  notes: z.string().optional().describe('Any notes or suggestions from the AI about the generated code or conversion process.'),
});
export type FigmaToCodeOutput = z.infer<typeof FigmaToCodeOutputSchema>;

export async function figmaToCode(input: FigmaToCodeInput): Promise<FigmaToCodeOutput> {
  if (!input.figmaUrl && !input.figmaFileDataUri) {
    throw new Error('Either figmaUrl or figmaFileDataUri must be provided.');
  }
  // In a real implementation, this would involve complex logic:
  // 1. Fetching/parsing the Figma file from URL or data URI.
  // 2. Analyzing the Figma design structure.
  // 3. Passing this structured data to an LLM.
  return figmaToCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'figmaToCodePrompt',
  input: {schema: FigmaToCodeInputSchema},
  output: {schema: FigmaToCodeOutputSchema},
  prompt: `You are an expert AI code generator specializing in converting Figma designs into production-ready code.
Input will be either a Figma file URL or a data URI of a .fig file, and the target framework.
{{#if figmaUrl}}
Figma Design URL: {{{figmaUrl}}}
{{else if figmaFileDataUri}}
Figma File Data URI provided (content not shown in prompt for brevity).
{{/if}}
Target Framework: {{{targetFramework}}}

Analyze the Figma design meticulously. Identify components, layouts, styles, and assets.
Generate clean, well-structured, and responsive code in the specified framework.
Output an array of files, each with a filename, language, and the code content.
If possible, provide notes on assumptions made or areas that might need manual review.

Example Output Structure:
{
  "generatedCode": [
    { "fileName": "MyComponent.tsx", "language": "tsx", "code": "..." },
    { "fileName": "styles.css", "language": "css", "code": "..." }
  ],
  "notes": "Consider optimizing images for production."
}

Focus on accuracy and adherence to best practices for the target framework.
For Tailwind CSS, use utility classes directly in the markup.
For React/Next.js, generate functional components.
The .fig file processing or URL fetching and parsing would happen before this prompt in a real system.
This prompt assumes the structured design information is available to the model.
For now, this is a placeholder. Generate a sample output for a simple component based on the framework.
`,
});

const figmaToCodeFlow = ai.defineFlow(
  {
    name: 'figmaToCodeFlow',
    inputSchema: FigmaToCodeInputSchema,
    outputSchema: FigmaToCodeOutputSchema,
  },
  async (input) => {
    // Placeholder: In a real scenario, this would involve complex Figma parsing
    // and then passing structured data to the LLM.
    // For now, we'll simulate a simple output.
    const {output} = await prompt(input);
    if (output) return output;

    // Fallback placeholder output if prompt fails or for initial setup
    const exampleCode = input.targetFramework === 'react-nextjs-tailwind'
      ? `// Placeholder for React/Next.js with Tailwind CSS\nconst ExampleComponent = () => {\n  return <div className="p-4 bg-blue-500 text-white rounded-lg shadow-md">\n      <h1 className="text-xl font-bold">Figma Component Placeholder</h1>\n      <p>Content derived from Figma design.</p>\n    </div>;\n};\nexport default ExampleComponent;`
      : `<!-- Placeholder for HTML with Tailwind CSS -->\n<div class="p-4 bg-green-500 text-white rounded-lg shadow-md">\n  <h1 class="text-xl font-bold">Figma Section Placeholder</h1>\n  <p>Content derived from Figma design.</p>\n</div>`;
    
    const fileName = input.targetFramework === 'react-nextjs-tailwind' ? 'ExampleComponent.tsx' : 'example.html';
    const language = input.targetFramework === 'react-nextjs-tailwind' ? 'tsx' : 'html';

    return {
      generatedCode: [
        {
          fileName: fileName,
          language: language,
          code: exampleCode,
        },
      ],
      notes: 'This is a placeholder output. Figma file processing and detailed AI generation are not yet fully implemented.',
    };
  }
);
