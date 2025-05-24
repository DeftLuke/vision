
'use client';

import React, { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ImageUploader from "@/components/vision-coder/ImageUploader"; // Reusing for consistency
import ImagePreview from "@/components/vision-coder/ImagePreview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Terminal, ScanText, Sparkles, Copy, ImageOff } from "lucide-react";

interface ImageToTextOutput {
  text: string;
}

type TaskType = "ocr" | "caption";

export default function ImageToTextPage() {
  const [uploadedImage, setUploadedImage] = useState<{ dataUri: string; name: string } | null>(null);
  const [taskType, setTaskType] = useState<TaskType>("ocr");
  const [resultText, setResultText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = useCallback((file: File, dataUri: string) => {
    setUploadedImage({ dataUri, name: file.name });
    setResultText(null); // Clear previous result
    setError(null); // Clear previous error
  }, []);

  const handleSubmit = async () => {
    if (!uploadedImage) {
      toast({
        title: "No Image Uploaded",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultText(null);

    try {
      const response = await fetch('/api/image-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoDataUri: uploadedImage.dataUri, taskType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: ImageToTextOutput = await response.json();
      setResultText(data.text);
      toast({
        title: "Processing Complete!",
        description: taskType === 'ocr' ? "Text extracted from image." : "Image caption generated.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied to clipboard!" });
    }).catch(() => {
      toast({ title: "Failed to copy", variant: "destructive" });
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
              <CardTitle className="text-2xl flex items-center"><ScanText className="mr-2 h-6 w-6 text-primary" /> Image-to-Text / Captioning</CardTitle>
              <CardDescription>Upload an image to extract text (OCR) or generate a descriptive caption.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploader onImageUpload={handleImageUpload} isLoading={isLoading} />
              
              {uploadedImage && (
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2 text-foreground/80">Selected Image:</h3>
                  <ImagePreview src={uploadedImage.dataUri} alt={uploadedImage.name} />
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-base font-semibold">Choose Task</Label>
                <RadioGroup
                  defaultValue="ocr"
                  onValueChange={(value) => setTaskType(value as TaskType)}
                  className="flex space-x-4"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ocr" id="ocr-task" />
                    <Label htmlFor="ocr-task">Extract Text (OCR)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="caption" id="caption-task" />
                    <Label htmlFor="caption-task">Generate Caption</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !uploadedImage}
                className="w-full" 
                aria-label={taskType === 'ocr' ? "Extract Text from Image" : "Generate Caption for Image"}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? 'Processing...' : (taskType === 'ocr' ? 'Extract Text' : 'Generate Caption')}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel: Output */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Result</CardTitle>
              <CardDescription>The {taskType === 'ocr' ? 'extracted text' : 'generated caption'} will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[200px]">
                  <LoadingSpinner size={32} />
                  <p className="text-muted-foreground">AI is processing the image...</p>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive" className="min-h-[150px]">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Processing Image</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!isLoading && !error && (
                <>
                  {resultText ? (
                    <div className="relative">
                       <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-[-10px] right-[-10px] h-7 w-7 z-10"
                          onClick={() => copyToClipboard(resultText)}
                          aria-label="Copy result"
                          title="Copy result"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      <Textarea
                        value={resultText}
                        readOnly
                        className="min-h-[200px] bg-secondary text-secondary-foreground font-mono text-sm"
                        aria-label="Result text"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[200px] flex flex-col items-center justify-center">
                      <ImageOff className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                      <p className="font-medium">Result will appear here</p>
                      <p className="text-sm text-muted-foreground/70">Upload an image and choose a task.</p>
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
