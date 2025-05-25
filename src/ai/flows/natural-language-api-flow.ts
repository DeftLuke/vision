'use server';
/**
 * @fileOverview An AI agent that builds API endpoint code from natural language descriptions.
 *
 * - buildApiFromNl - A function that handles API code generation.
 * - BuildApiFromNlInput - The input type for buildApiFromNl.
 * - BuildApiFromNlOutput - The return type for buildApiFromNl.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const BuildApiFromNlInputSchema = z.object({
  description: z.string().describe('Natural language description of the API endpoint(s) to create. E.g., "Create a REST API for user authentication with JWT using Node.js and Express."'),
  targetFramework: z.enum(['nodejs-express', 'nodejs-fastify', 'python-flask', 'python-fastapi']).describe('The desired backend framework and language.'),
  // Potentially add options for database, ORM, specific libraries, etc.
});
export type BuildApiFromNlInput = z.infer<typeof BuildApiFromNlInputSchema>;

export const BuildApiFromNlOutputSchema = z.object({
  generatedFiles: z.array(z.object({
    fileName: z.string().describe('The name of the generated file (e.g., routes.js, model.js, server.js).'),
    language: z.string().describe('The language of the code (e.g., javascript, python).'),
    code: z.string().describe('The generated code content for the API.'),
  })).describe('An array of generated code files for the API.'),
  readme: z.string().optional().describe('Instructions or notes on how to set up and run the generated API code, including dependencies.'),
  notes: z.string().optional().describe('Any additional notes or suggestions from the AI.'),
});
export type BuildApiFromNlOutput = z.infer<typeof BuildApiFromNlOutputSchema>;

export async function buildApiFromNl(input: BuildApiFromNlInput): Promise<BuildApiFromNlOutput> {
  return buildApiFromNlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'buildApiFromNlPrompt',
  input: {schema: BuildApiFromNlInputSchema},
  output: {schema: BuildApiFromNlOutputSchema},
  prompt: `You are an expert AI backend developer.
Your task is to generate complete, runnable API endpoint code based on a natural language description and a specified framework.

Description:
{{{description}}}

Target Framework: {{{targetFramework}}}

Generate all necessary files (e.g., server setup, routes, controllers/handlers, models if applicable, middleware, validation logic).
Include basic error handling and best practices for the chosen framework.
Provide a README section with setup instructions, dependencies to install, and how to run the server.
Structure the output as an array of files, each with a filename, language, and code.

Example Output for a simple endpoint:
{
  "generatedFiles": [
    {
      "fileName": "server.js",
      "language": "javascript",
      "code": "// Express server setup code..."
    },
    {
      "fileName": "routes/userRoutes.js",
      "language": "javascript",
      "code": "// User authentication routes..."
    }
  ],
  "readme": "To run this API:\n1. npm install express jsonwebtoken bcrypt\n2. node server.js\nAPI will be available at http://localhost:3000",
  "notes": "JWT secret should be stored securely in environment variables."
}

Focus on creating a functional and secure starting point.
For now, this is a placeholder. Generate a sample output for the specified framework and description.
`,
});

const buildApiFromNlFlow = ai.defineFlow(
  {
    name: 'buildApiFromNlFlow',
    inputSchema: BuildApiFromNlInputSchema,
    outputSchema: BuildApiFromNlOutputSchema,
  },
  async (input) => {
    // Placeholder:
    const {output} = await prompt(input);
    if (output) return output;

    // Fallback placeholder output
    let exampleCode = `// Placeholder for ${input.targetFramework}\n// API description: ${input.description}\n`;
    let language = 'javascript';
    let fileName = 'server_placeholder.js';

    if (input.targetFramework.startsWith('nodejs')) {
      language = 'javascript';
      fileName = 'server.js';
      exampleCode += `
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Example route based on description (highly simplified)
app.get('/api/data', (req, res) => {
  res.json({ message: "Data for: ${input.description}" });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port} for API: ${input.description}\`);
});
      `;
    } else if (input.targetFramework.startsWith('python')) {
      language = 'python';
      fileName = 'app.py';
      exampleCode += `
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/data')
def get_data():
    return jsonify(message="Data for: ${input.description}")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
      `;
    }


    return {
      generatedFiles: [
        {
          fileName: fileName,
          language: language,
          code: exampleCode,
        },
      ],
      readme: `Placeholder README:\n1. Install necessary dependencies (e.g., npm install express or pip install Flask).\n2. Run the main file (e.g., node ${fileName} or python ${fileName}).`,
      notes: 'This is a placeholder output. Full API generation with detailed logic, error handling, and security considerations is complex and not yet fully implemented.',
    };
  }
);
