
'use client';

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ServerCog, Loader2, AlertTriangle } from "lucide-react"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SyntaxHighlighter from "@/components/shared/SyntaxHighlighter";
import { useToast } from "@/hooks/use-toast";
import type { BuildApiFromNlOutput } from "@/ai/flows/natural-language-api-flow";

type TargetApiFramework = "nodejs-express" | "nodejs-fastify" | "python-flask" | "python-fastapi";

export default function NaturalLanguageApiBuilderPage() {
  const [description, setDescription] = useState<string>("");
  const [targetFramework, setTargetFramework] = useState<TargetApiFramework>("nodejs-express");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<BuildApiFromNlOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Missing",
        description: "Please describe the API you want to build.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedOutput(null);

    try {
      const response = await fetch('/api/natural-language-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, targetFramework }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: BuildApiFromNlOutput = await response.json();
      setGeneratedOutput(data);
      toast({
        title: "API Code Generated!",
        description: "The API structure and files are ready.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "API Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="shadow-lg w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <ServerCog className="mr-2 h-6 w-6 text-primary" /> Natural Language API Builder
            </CardTitle>
            <CardDescription>
              Describe your API (e.g., "User auth with JWT") and select a framework to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="api-description">API Description</Label>
              <Textarea 
                id="api-description" 
                placeholder="e.g., Create a REST API for user authentication with JWT using Node.js and Express, including signup, login, and a protected /profile route."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
                disabled={isLoading} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-api-framework">Target Framework</Label>
              <Select 
                value={targetFramework} 
                onValueChange={(value) => setTargetFramework(value as TargetApiFramework)}
                disabled={isLoading}
              >
                <SelectTrigger id="target-api-framework">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nodejs-express">Node.js + Express</SelectItem>
                  <SelectItem value="nodejs-fastify">Node.js + Fastify</SelectItem>
                  <SelectItem value="python-flask">Python + Flask</SelectItem>
                  <SelectItem value="python-fastapi">Python + FastAPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSubmit} disabled={isLoading || !description.trim()} className="w-full">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building API...</> : "Build API"}
            </Button>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-md flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error Building API</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {generatedOutput && (
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold">Generated API Files</h3>
                 {generatedOutput.readme && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-3 bg-muted/50 border-b">
                      <span className="font-mono text-sm font-medium">README.md</span>
                    </div>
                    <div className="p-4 bg-background text-sm whitespace-pre-wrap max-h-[300px] overflow-auto">
                      {generatedOutput.readme}
                    </div>
                  </div>
                )}
                {generatedOutput.notes && (
                  <div className="p-3 bg-accent/10 text-accent-foreground border border-accent/30 rounded-md">
                    <p className="font-medium text-sm">AI Notes:</p>
                    <p className="text-xs whitespace-pre-wrap">{generatedOutput.notes}</p>
                  </div>
                )}
                {generatedOutput.generatedFiles.map((file, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="p-3 bg-muted/50 border-b flex justify-between items-center">
                      <span className="font-mono text-sm font-medium">{file.fileName}</span>
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{file.language}</span>
                    </div>
                    <SyntaxHighlighter 
                      code={file.code} 
                      language={file.language.includes('python') ? 'python' : 'javascript'} 
                      className="max-h-[400px]"
                    />
                  </div>
                ))}
                <div className="mt-4 p-3 border border-dashed rounded-md text-xs text-center text-muted-foreground bg-muted/20">
                  <p><strong>Note:</strong> API generation from natural language is complex. The current output is a placeholder/simplified version. Full implementation with robust security, error handling, and database integration is still under development.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border/70">
        © {new Date().getFullYear()} AI Studio. Powered by AI.
      </footer>
    </div>
  );
}
