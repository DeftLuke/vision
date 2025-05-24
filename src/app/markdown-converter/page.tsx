
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
import { Terminal, Sparkles, FileCode2, Copy, Eye } from "lucide-react";
import SyntaxHighlighter from "@/components/shared/SyntaxHighlighter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface MarkdownToHtmlOutput {
  htmlContent: string;
}

export default function MarkdownConverterPage() {
  const [markdownText, setMarkdownText] = useState<string>("");
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!markdownText.trim() && markdownText.length > 0) { // Allow empty to show structure, but not just whitespace
        toast({
        title: "Markdown is Empty",
        description: "Please enter some Markdown text to convert.",
        variant: "destructive",
      });
      return;
    }


    setIsLoading(true);
    setError(null);
    setHtmlContent(null);

    try {
      const response = await fetch('/api/markdown-to-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdownText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: MarkdownToHtmlOutput = await response.json();
      setHtmlContent(data.htmlContent);
      toast({
        title: "Conversion Complete!",
        description: "Markdown has been converted to HTML.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Conversion Failed",
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
              <CardTitle className="text-2xl flex items-center"><FileCode2 className="mr-2 h-6 w-6 text-primary" /> Markdown to HTML Converter</CardTitle>
              <CardDescription>Input Markdown text to generate a responsive HTML page styled with Tailwind CSS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="markdown-input" className="text-base font-semibold">Markdown Input</Label>
                <Textarea
                  id="markdown-input"
                  placeholder="## Hello World!\n\nThis is **Markdown**.\n\n- Item 1\n- Item 2"
                  value={markdownText}
                  onChange={(e) => setMarkdownText(e.target.value)}
                  className="min-h-[300px] focus-visible:ring-primary font-mono text-sm"
                  disabled={isLoading}
                  aria-label="Markdown input for conversion"
                />
              </div>
              <Button 
                onClick={handleConvert} 
                disabled={isLoading || !markdownText.trim()}
                className="w-full" 
                aria-label="Convert Markdown to HTML"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? 'Converting...' : 'Convert to HTML'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel: Output */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Generated HTML & Preview</CardTitle>
              <CardDescription>View the generated HTML code and a live preview.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[200px]">
                  <LoadingSpinner size={32} />
                  <p className="text-muted-foreground">Converting Markdown...</p>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive" className="min-h-[150px]">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Converting Markdown</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!isLoading && !error && (
                <>
                  {htmlContent ? (
                    <Tabs defaultValue="preview" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4" />Preview</TabsTrigger>
                        <TabsTrigger value="html"><FileCode2 className="mr-2 h-4 w-4" />HTML</TabsTrigger>
                      </TabsList>
                      <TabsContent value="preview" className="mt-2">
                        <iframe
                          srcDoc={htmlContent}
                          title="HTML Preview"
                          className="w-full h-[400px] min-h-[300px] border rounded-md bg-white"
                          sandbox="allow-scripts" // Be cautious with AI-generated HTML/JS
                        />
                      </TabsContent>
                      <TabsContent value="html" className="mt-2">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 z-10"
                            onClick={() => copyToClipboard(htmlContent)}
                            aria-label="Copy HTML code"
                            title="Copy HTML code"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <SyntaxHighlighter code={htmlContent} language="html" className="max-h-[400px]" />
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[300px] flex flex-col items-center justify-center">
                      <FileCode2 className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                      <p className="font-medium">HTML output will appear here</p>
                      <p className="text-sm text-muted-foreground/70">Enter Markdown and click "Convert to HTML".</p>
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
