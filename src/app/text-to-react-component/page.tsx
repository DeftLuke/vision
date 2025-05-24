
'use client';

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Sparkles, Component as ComponentIcon, Copy } from "lucide-react";
import SyntaxHighlighter from "@/components/shared/SyntaxHighlighter";

interface GenerateReactComponentOutput {
  componentCode: string;
}

export default function TextToReactComponentPage() {
  const [description, setDescription] = useState<string>("");
  const [componentCode, setComponentCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateComponent = async () => {
    if (!description.trim()) {
      toast({
        title: "Description is Empty",
        description: "Please describe the React component you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setComponentCode(null);

    try {
      const response = await fetch('/api/generate-react-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: GenerateReactComponentOutput = await response.json();
      if (!data.componentCode) {
         throw new Error("Received no component code from the server.");
      }
      setComponentCode(data.componentCode);
      toast({
        title: "React Component Generated!",
        description: "The component code is ready.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Component code has been copied.",
      });
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Could not copy code.",
        variant: "destructive",
      });
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel: Input */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><ComponentIcon className="mr-2 h-6 w-6 text-primary" /> Text-to-React Component</CardTitle>
              <CardDescription>Describe the React component you need, and AI will generate the JSX and Tailwind CSS code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="component-description" className="text-base font-semibold">Component Description</Label>
                <Textarea
                  id="component-description"
                  placeholder="e.g., 'A responsive React login form with email and password fields, a submit button, and basic validation styling using Tailwind CSS.' or 'A product card component with an image, title, price, and an add to cart button.'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px] focus-visible:ring-primary"
                  disabled={isLoading}
                  aria-label="React component description input"
                />
              </div>
              <Button 
                onClick={handleGenerateComponent} 
                disabled={isLoading || !description.trim()}
                className="w-full" 
                aria-label="Generate React Component"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating Component...' : 'Generate Component'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel: Output */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Generated Component Code</CardTitle>
              <CardDescription>The AI-generated React component code (JSX with Tailwind CSS) will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[200px]">
                  <LoadingSpinner size={32} />
                  <p className="text-muted-foreground">Generating component...</p>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive" className="min-h-[150px]">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Generating Component</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!isLoading && !error && (
                <>
                  {componentCode ? (
                    <div className="relative">
                       <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 z-10"
                          onClick={() => copyToClipboard(componentCode)}
                          aria-label="Copy component code"
                          title="Copy component code"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <SyntaxHighlighter code={componentCode} language="javascript" /> 
                        {/* Using 'javascript' for tsx highlighting for now, can be improved with a dedicated tsx highlighter */}
                      </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[200px] flex flex-col items-center justify-center">
                      <ComponentIcon className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                      <p className="font-medium">Your component code will appear here</p>
                      <p className="text-sm text-muted-foreground/70">Describe your component and click "Generate Component".</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border/70">
        © {new Date().getFullYear()} AI Studio. Powered by AI.
      </footer>
    </div>
  );
}
