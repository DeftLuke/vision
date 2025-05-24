
'use client';

import React, { useState, useMemo, type DragEvent, type MouseEvent } from "react";
import Image from 'next/image';
import Header from "@/components/layout/Header";
import ImageUploader from "@/components/vision-coder/ImageUploader";
import ImagePreview from "@/components/vision-coder/ImagePreview";
import PromptInput from "@/components/vision-coder/PromptInput";
import CodeDisplay from "@/components/vision-coder/CodeDisplay";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Terminal, ImageOff, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeneratedCode {
  html: string;
  tailwindCss: string;
  javaScript?: string;
}

interface UploadedImageFile {
  id: string;
  dataUri: string;
  name: string;
}

export default function VisionCoderPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Generate advanced Next.js page code using Pages Router and Tailwind CSS.");
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedImage = useMemo(() => {
    return uploadedImages.find(img => img.id === selectedImageId);
  }, [uploadedImages, selectedImageId]);

  const handleImageUpload = (file: File, dataUri: string) => {
    const newImageId = `${Date.now()}-${file.name}-${Math.random().toString(36).substring(2, 7)}`;
    const newImage: UploadedImageFile = { id: newImageId, dataUri, name: file.name };
    
    setUploadedImages(prevImages => [...prevImages, newImage]);
    setSelectedImageId(newImageId); // Auto-select the newly uploaded image

    setGeneratedCode(null); // Clear previous code
    setError(null); // Clear previous error
  };

  const handleSelectImage = (imageId: string) => {
    if (selectedImageId === imageId) {
      // Deselect if the same image is clicked again
      setSelectedImageId(null);
      setGeneratedCode(null);
      setError(null);
    } else {
      setSelectedImageId(imageId);
      setGeneratedCode(null); // Clear code when selection changes
      setError(null);
    }
  };

  const handleDeleteImage = (imageIdToDelete: string, event: MouseEvent) => {
    event.stopPropagation(); // Prevent triggering handleSelectImage

    setUploadedImages(prevImages => prevImages.filter(img => img.id !== imageIdToDelete));
    if (selectedImageId === imageIdToDelete) {
      setSelectedImageId(null);
      setGeneratedCode(null);
      setError(null);
    }
    toast({
      title: "Image Deleted",
      description: "The image has been removed from the list.",
    });
  };

  const handleGenerateCode = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload and select an image first.",
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
        body: JSON.stringify({ photoDataUri: selectedImage.dataUri, prompt }),
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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Upload Your UI Design</CardTitle>
              <CardDescription>Drag & drop, paste, or click to upload screenshots of your UI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploader onImageUpload={handleImageUpload} isLoading={isLoading} />
              
              {uploadedImages.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-medium mb-2 text-foreground/80">Your Uploads ({uploadedImages.length}):</h3>
                    <ScrollArea className="h-44 w-full rounded-md border border-border/70 p-3 bg-muted/20">
                      <div className="flex space-x-4 pb-2">
                        {uploadedImages.map((image) => (
                          <div
                            key={image.id}
                            onClick={() => handleSelectImage(image.id)}
                            className={cn(
                              "w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 hover:border-primary/70 relative group shadow-sm hover:shadow-md transition-all duration-150 ease-in-out",
                              selectedImageId === image.id ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-muted/50"
                            )}
                            title={`Select ${image.name}. Click again to deselect.`}
                            aria-pressed={selectedImageId === image.id}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectImage(image.id); }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 z-20 text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/80 opacity-60 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleDeleteImage(image.id, e)}
                              aria-label={`Delete image ${image.name}`}
                              title={`Delete ${image.name}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Image
                              src={image.dataUri}
                              alt={image.name}
                              layout="fill"
                              objectFit="cover"
                              className="transition-transform group-hover:scale-105"
                              data-ai-hint="thumbnail ui"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
                              <p className="text-xs truncate font-medium">{image.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {selectedImage && (
                    <div>
                      <h3 className="text-md font-medium mb-2 text-foreground/80">Preview for Generation:</h3>
                      <ImagePreview 
                        src={selectedImage.dataUri} 
                        alt={`Preview: ${selectedImage.name}`} 
                      />
                    </div>
                  )}
                  {!selectedImage && uploadedImages.length > 0 && (
                     <div className="text-center py-4 text-muted-foreground flex flex-col items-center justify-center border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[150px]">
                        <ImageOff className="w-10 h-10 mb-2 text-muted-foreground/50" />
                        <p className="font-medium">No image selected.</p>
                        <p className="text-sm">Click an uploaded image thumbnail to preview and generate code.</p>
                    </div>
                  )}
                </div>
              )}
               {uploadedImages.length === 0 && (
                 <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[200px]">
                    <ImageOff className="w-12 h-12 mb-3 text-muted-foreground/40" />
                    <p className="font-medium">Upload your first UI image to get started.</p>
                    <p className="text-sm text-muted-foreground/70">Supports PNG, JPG, GIF, WEBP.</p>
                </div>
               )}
            </CardContent>
          </Card>

          {/* Right Panel */}
          <Card className="shadow-lg">
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
                disabled={!selectedImage || isLoading}
              />
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[200px]">
                  <LoadingSpinner size={32} />
                  <p className="text-muted-foreground">Generating code, please wait...</p>
                  <p className="text-sm text-muted-foreground/70">This may take a few moments.</p>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive" className="min-h-[150px]">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Generating Code</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!isLoading && !error && (
                <>
                  {generatedCode && selectedImage ? (
                    <CodeDisplay code={generatedCode} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[200px] flex flex-col items-center justify-center">
                       {uploadedImages.length === 0 ? (
                         <>
                           <ImageOff className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                           <p className="font-medium">Upload an image</p>
                           <p className="text-sm text-muted-foreground/70">Upload on the left to begin.</p>
                         </>
                       ) : !selectedImage ? (
                         <>
                           <ImageOff className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                           <p className="font-medium">Select an image</p>
                           <p className="text-sm text-muted-foreground/70">Choose from your uploads.</p>
                         </>
                       ) : ( 
                         <>
                           <Sparkles className="w-10 h-10 mb-2 mx-auto text-primary/70" />
                           <p className="font-medium">Ready to Generate</p>
                           <p className="text-sm text-muted-foreground/70">Edit the prompt and click "Generate Code".</p>
                         </>
                       )}
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
