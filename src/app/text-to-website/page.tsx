
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
import { Terminal, Sparkles, Globe2 } from "lucide-react";
import CodeDisplay from "@/components/vision-coder/CodeDisplay"; // Reused for HTML/CSS/JS output

interface GeneratedSiteCode {
  html: string;
  tailwindCss: string;
  javaScript?: string;
}

export default function TextToWebsitePage() {
  const [description, setDescription] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<GeneratedSiteCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateWebsite = async () => {
    if (!description.trim()) {
      toast({
        title: "Description is Empty",
        description: "Please describe the website you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedCode(null);

    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: GeneratedSiteCode = await response.json();
      if (!data.html || !data.tailwindCss) {
         throw new Error("Received incomplete website code from the server.");
      }
      setGeneratedCode(data);
      toast({
        title: "Website Generated!",
        description: "The website code is ready.",
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
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="shadow-lg w-full">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><Globe2 className="mr-2 h-6 w-6 text-primary" /> Text-to-Website Generator</CardTitle>
            <CardDescription>Describe the website you want to create, and AI will generate the HTML, Tailwind CSS, and JavaScript for it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="website-description" className="text-base font-semibold">Website Description</Label>
              <Textarea
                id="website-description"
                placeholder="e.g., 'A modern landing page for a fitness app with a hero section, features, testimonials, and a contact form. Use a dark theme with vibrant green accents.' or 'A simple portfolio website for a photographer with a gallery and an about me page.'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px] focus-visible:ring-primary"
                disabled={isLoading}
                aria-label="Website description input"
              />
            </div>
            <Button 
              onClick={handleGenerateWebsite} 
              disabled={isLoading || !description.trim()}
              className="w-full md:w-auto" 
              aria-label="Generate Website"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? 'Generating Website...' : 'Generate Website'}
            </Button>

            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[200px]">
                <LoadingSpinner size={32} />
                <p className="text-muted-foreground">Generating your website, please wait...</p>
                <p className="text-sm text-muted-foreground/70">This might take a few moments for complex sites.</p>
              </div>
            )}
            {error && !isLoading && (
              <Alert variant="destructive" className="min-h-[150px]">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Generating Website</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!isLoading && !error && (
              <>
                {generatedCode ? (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Generated Website Code:</h3>
                    <CodeDisplay code={generatedCode} />
                  </div>
                ) : (
                  !description && // Show placeholder only if no description and not loading/error
                  <div className="mt-6 text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[200px] flex flex-col items-center justify-center">
                    <Globe2 className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                    <p className="font-medium">Your website code will appear here</p>
                    <p className="text-sm text-muted-foreground/70">Describe your website and click "Generate Website".</p>
                  </div>
                )}
              </>
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
