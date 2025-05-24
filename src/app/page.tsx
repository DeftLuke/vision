'use client';

import React, { useState, type DragEvent } from "react";
import Header from "@/components/layout/Header";
import ImageUploader from "@/components/vision-coder/ImageUploader";
import ImagePreview from "@/components/vision-coder/ImagePreview";
import PromptInput from "@/components/vision-coder/PromptInput";
import CodeDisplay from "@/components/vision-coder/CodeDisplay";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { readFileAsDataURI } from "@/lib/image-utils";
import { useToast } from "@/hooks/use-toast";
import { Terminal } from "lucide-react";


interface GeneratedCode {
  html: string;
  tailwindCss: string;
  javaScript?: string;
}

export default function VisionCoderPage() {
  const [uploadedImageURI, setUploadedImageURI] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Generate a responsive component based on this image. Include HTML and Tailwind CSS.");
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File, dataUri: string) => {
    setUploadedImageURI(dataUri);
    setGeneratedCode(null); // Clear previous code
    setError(null); // Clear previous error
  };

  const handleGenerateCode = async () => {
    if (!uploadedImageURI) {
      toast({
        title: "No Image Uploaded",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }
    if (!prompt.trim()) {
      toast({
        title: "Prompt is Empty",
        description: "Please provide a prompt for code generation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedCode(null);

    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoDataUri: uploadedImageURI, prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: GeneratedCode = await response.json();
      if (!data.html || !data.tailwindCss) {
         throw new Error("Received incomplete code from the server. HTML or CSS might be missing.");
      }
      setGeneratedCode(data);
      toast({
        title: "Code Generated!",
        description: "HTML and Tailwind CSS are ready.",
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
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Upload Your UI Design</CardTitle>
              <CardDescription>Drag & drop or click to upload a screenshot of your UI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploader onImageUpload={handleImageUpload} isLoading={isLoading} />
              {uploadedImageURI && <ImagePreview src={uploadedImageURI} alt="Uploaded UI design" />}
            </CardContent>
          </Card>

          {/* Right Panel */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Generated Code</CardTitle>
              <CardDescription>Review the AI-generated HTML & Tailwind CSS. Customize with a prompt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleGenerateCode}
                isLoading={isLoading}
              />
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 py-8">
                  <LoadingSpinner size={32} />
                  <p className="text-muted-foreground">Generating code, please wait...</p>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Generating Code</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!isLoading && generatedCode && (
                <CodeDisplay code={generatedCode} />
              )}
              {!isLoading && !generatedCode && !error && (
                 <div className="text-center py-8 text-muted-foreground">
                    <p>Upload an image and provide a prompt to see the generated code here.</p>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} VisionCoder. Powered by AI.
      </footer>
    </div>
  );
}
