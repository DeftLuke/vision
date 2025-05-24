
'use client';

import React, { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ImageUploader from "@/components/vision-coder/ImageUploader";
import ImagePreview from "@/components/vision-coder/ImagePreview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Lightbulb, Sparkles, Copy, ImageOff } from "lucide-react";
// import ReactMarkdown from 'react-markdown'; // For better markdown rendering

interface DesignFeedbackOutput {
  feedbackText: string;
}

export default function DesignFeedbackPage() {
  const [uploadedImage, setUploadedImage] = useState<{ dataUri: string; name: string } | null>(null);
  const [feedbackFocus, setFeedbackFocus] = useState<string>("");
  const [feedbackResult, setFeedbackResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = useCallback((file: File, dataUri: string) => {
    setUploadedImage({ dataUri, name: file.name });
    setFeedbackResult(null);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!uploadedImage) {
      toast({
        title: "No Image Uploaded",
        description: "Please upload a UI design or screenshot.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setFeedbackResult(null);

    try {
      const response = await fetch('/api/design-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoDataUri: uploadedImage.dataUri, feedbackFocus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: DesignFeedbackOutput = await response.json();
      setFeedbackResult(data.feedbackText);
      toast({
        title: "Feedback Generated!",
        description: "AI design feedback is ready.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Feedback Generation Failed",
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
              <CardTitle className="text-2xl flex items-center"><Lightbulb className="mr-2 h-6 w-6 text-primary" /> AI Design Feedback</CardTitle>
              <CardDescription>Upload your UI design or screenshot to get AI-powered feedback and suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploader onImageUpload={handleImageUpload} isLoading={isLoading} />
              
              {uploadedImage && (
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2 text-foreground/80">Selected Image for Feedback:</h3>
                  <ImagePreview src={uploadedImage.dataUri} alt={uploadedImage.name} />
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="feedback-focus" className="text-base font-semibold">Feedback Focus (Optional)</Label>
                <Input
                  id="feedback-focus"
                  placeholder="e.g., layout, color scheme, user experience, accessibility"
                  value={feedbackFocus}
                  onChange={(e) => setFeedbackFocus(e.target.value)}
                  disabled={isLoading}
                  aria-label="Specific areas for design feedback"
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !uploadedImage}
                className="w-full" 
                aria-label="Get Design Feedback"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? 'Analyzing Design...' : 'Get Feedback'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel: Output */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Design Feedback</CardTitle>
              <CardDescription>The AI's analysis and suggestions for your design will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[200px]">
                  <LoadingSpinner size={32} />
                  <p className="text-muted-foreground">AI is analyzing your design...</p>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive" className="min-h-[150px]">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Getting Feedback</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!isLoading && !error && (
                <>
                  {feedbackResult ? (
                    <div className="relative">
                       <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-[-10px] right-[-10px] h-7 w-7 z-10"
                          onClick={() => copyToClipboard(feedbackResult)}
                          aria-label="Copy feedback"
                          title="Copy feedback"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      <div className="p-4 rounded-md bg-secondary text-secondary-foreground overflow-auto text-sm max-h-[600px] min-h-[250px] prose dark:prose-invert prose-sm max-w-none">
                        {/* Basic Markdown-like rendering. A proper Markdown component would be better. */}
                        <div dangerouslySetInnerHTML={{ __html: feedbackResult.replace(/```([\s\S]*?)```/g, (match, code) => `<pre class="bg-muted p-2 rounded-md overflow-x-auto"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`).replace(/\n/g, '<br />') }} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[250px] flex flex-col items-center justify-center">
                      <ImageOff className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                      <p className="font-medium">Design feedback will appear here</p>
                      <p className="text-sm text-muted-foreground/70">Upload a design and optionally specify focus areas.</p>
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
