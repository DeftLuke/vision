
'use client';

import React, { useState } from "react";
import Image from 'next/image';
import Header from "@/components/layout/Header";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Download, Sparkles, Image as ImageIconLucide } from "lucide-react";

interface GeneratedImageData {
  imageDataUri: string;
}

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt is Empty",
        description: "Please enter a prompt for image generation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: GeneratedImageData = await response.json();
      if (!data.imageDataUri) {
         throw new Error("Received incomplete image data from the server.");
      }
      setGeneratedImage(data.imageDataUri);
      toast({
        title: "Image Generated!",
        description: "Your image is ready.",
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

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    const filenameSafePrompt = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `generated_image_${filenameSafePrompt || Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Image Downloaded",
      description: "The image has been saved to your device.",
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
              <CardTitle className="text-2xl">Generate Image from Text</CardTitle>
              <CardDescription>Describe the image you want the AI to create.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="image-prompt-input" className="text-base font-semibold">Your Prompt</Label>
                <Textarea
                  id="image-prompt-input"
                  placeholder="e.g., 'A majestic lion wearing a crown, sitting on a throne in a vibrant jungle', 'Impressionist painting of a Parisian cafe scene at dusk'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] focus-visible:ring-primary"
                  disabled={isLoading}
                  aria-label="Image generation prompt"
                />
              </div>
              <Button 
                onClick={handleGenerateImage} 
                disabled={isLoading || !prompt.trim()}
                className="w-full" 
                aria-label="Generate Image from Prompt"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate Image'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel: Output */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Generated Image</CardTitle>
              <CardDescription>View your AI-generated image below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[300px] aspect-square">
                  <LoadingSpinner size={32} />
                  <p className="text-muted-foreground">Generating your image...</p>
                  <p className="text-sm text-muted-foreground/70">This can take a few moments.</p>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive" className="min-h-[150px]">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Generating Image</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!isLoading && !error && (
                <>
                  {generatedImage ? (
                    <div className="space-y-4">
                      <div className="border border-border rounded-lg overflow-hidden shadow-sm aspect-square relative bg-muted/20">
                        <Image
                          src={generatedImage}
                          alt={prompt || "AI generated image"}
                          layout="fill"
                          objectFit="contain"
                          className="p-2"
                          data-ai-hint="generated art abstract"
                        />
                      </div>
                      <Button onClick={handleDownloadImage} className="w-full" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Image
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[300px] aspect-square flex flex-col items-center justify-center">
                      <ImageIconLucide className="w-12 h-12 mb-3 text-muted-foreground/40" />
                      <p className="font-medium">Your image will appear here</p>
                      <p className="text-sm text-muted-foreground/70">Enter a prompt and click "Generate Image".</p>
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
