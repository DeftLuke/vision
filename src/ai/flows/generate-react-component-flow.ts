
'use server';
/**
 * @fileOverview An AI agent that generates React components from text descriptions.
 *
 * - generateReactComponent - A function that handles the React component generation process.
 * - GenerateReactComponentInput - The input type for the generateReactComponent function.
 * - GenerateReactComponentOutput - The return type for the generateReactComponent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReactComponentInputSchema = z.object({
  description: z.string().describe('A detailed text description of the React component to be generated.'),
  // Future options: state management (useState, useReducer), props definition
});
export type GenerateReactComponentInput = z.infer<typeof GenerateReactComponentInputSchema>;

const GenerateReactComponentOutputSchema = z.object({
  componentCode: z.string().describe('The generated React functional component code (JSX with Tailwind CSS).'),
});
export type GenerateReactComponentOutput = z.infer<typeof GenerateReactComponentOutputSchema>;

export async function generateReactComponent(input: GenerateReactComponentInput): Promise<GenerateReactComponentOutput> {
  return generateReactComponentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReactComponentPrompt',
  input: {schema: GenerateReactComponentInputSchema},
  output: {schema: GenerateReactComponentOutputSchema},
  prompt: `You are an AI expert in React development.
Your task is to create a responsive React functional component based on the following description.
The component MUST use JSX for its structure and Tailwind CSS for all styling.
Ensure the component is self-contained, import necessary hooks from 'react' (like useState, useEffect if needed), and follows React best practices.
Provide only the complete React component code as a single block. Do not include any explanations or surrounding text.

Component Description:
"{{{description}}}"

React Component Code (JSX with Tailwind CSS):
\`\`\`tsx
// Start of React component code
import React from 'react'; // Or import { useState, useEffect } from 'react'; if needed

// Example: const MyComponent = (props) => { ... }
// export default MyComponent;

// Replace with the actual component code based on the description
const PlaceholderComponent = () => {
  return (
    <div className="p-4 border rounded-md">
      <p className="text-lg font-semibold">Generated React Component</p>
      <p>Description: {{{description}}}</p>
    </div>
  );
};

export default PlaceholderComponent;
// End of React component code
\`\`\`
`,
});


const generateReactComponentFlow = ai.defineFlow(
  {
    name: 'generateReactComponentFlow',
    inputSchema: GenerateReactComponentInputSchema,
    outputSchema: GenerateReactComponentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    // The model might include the ```tsx ... ``` markdown, so we need to extract the code.
    let code = output!.componentCode;
    const codeBlockRegex = /```(?:tsx|jsx|javascript)?\s*([\s\S]*?)\s*```/;
    const match = codeBlockRegex.exec(code);
    if (match && match[1]) {
      code = match[1].trim();
    }
    return { componentCode: code };
  }
);
