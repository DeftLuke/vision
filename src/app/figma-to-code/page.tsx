
'use client';

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, Loader2, AlertTriangle } from "lucide-react"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SyntaxHighlighter from "@/components/shared/SyntaxHighlighter";
import { useToast } from "@/hooks/use-toast";
import type { FigmaToCodeOutput } from "@/ai/flows/figma-to-code-flow";

type TargetFramework = "react-nextjs-tailwind" | "html-tailwind";

export default function FigmaToCodePage() {
  const [figmaUrl, setFigmaUrl] = useState<string>("");
  const [figmaFile, setFigmaFile] = useState<File | null>(null);
  const [figmaFileDataUri, setFigmaFileDataUri] = useState<string | null>(null);
  const [targetFramework, setTargetFramework] = useState<TargetFramework>("react-nextjs-tailwind");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<FigmaToCodeOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.fig')) {
        setFigmaFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setFigmaFileDataUri(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        setFigmaUrl(""); // Clear URL if file is selected
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .fig file.",
          variant: "destructive",
        });
        setFigmaFile(null);
        setFigmaFileDataUri(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!figmaUrl && !figmaFileDataUri) {
      toast({
        title: "Input Missing",
        description: "Please provide a Figma URL or upload a .fig file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedOutput(null);

    try {
      const payload: any = { targetFramework };
      if (figmaUrl) {
        payload.figmaUrl = figmaUrl;
      } else if (figmaFileDataUri) {
        payload.figmaFileDataUri = figmaFileDataUri;
      }

      const response = await fetch('/api/figma-to-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: FigmaToCodeOutput = await response.json();
      setGeneratedOutput(data);
      toast({
        title: "Code Generation Complete!",
        description: "Figma design has been converted.",
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
        <Card className="shadow-lg w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Layers className="mr-2 h-6 w-6 text-primary" /> Figma to Code Converter
            </CardTitle>
            <CardDescription>
              Upload a .fig file or provide a Figma URL to generate Tailwind + React/Next.js or HTML code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="figma-url">Figma URL</Label>
              <Input 
                id="figma-url" 
                type="url" 
                placeholder="https://www.figma.com/file/..." 
                value={figmaUrl}
                onChange={(e) => {
                  setFigmaUrl(e.target.value);
                  if (e.target.value) {
                    setFigmaFile(null);
                    setFigmaFileDataUri(null);
                  }
                }}
                disabled={isLoading} 
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">OR</div>
            <div className="space-y-2">
              <Label htmlFor="figma-file">Upload .fig File</Label>
              <Input 
                id="figma-file" 
                type="file" 
                accept=".fig"
                onChange={handleFileChange}
                disabled={isLoading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {figmaFile && <p className="text-sm text-muted-foreground mt-1">Selected: {figmaFile.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-framework">Target Framework</Label>
              <Select 
                value={targetFramework} 
                onValueChange={(value) => setTargetFramework(value as TargetFramework)}
                disabled={isLoading}
              >
                <SelectTrigger id="target-framework">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react-nextjs-tailwind">React/Next.js + Tailwind</SelectItem>
                  <SelectItem value="html-tailwind">HTML + Tailwind</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSubmit} disabled={isLoading || (!figmaUrl && !figmaFile)} className="w-full">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Code"}
            </Button>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-md flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error Generating Code</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {generatedOutput && (
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold">Generated Output</h3>
                {generatedOutput.notes && (
                  <div className="p-3 bg-accent/10 text-accent-foreground border border-accent/30 rounded-md">
                    <p className="font-medium text-sm">AI Notes:</p>
                    <p className="text-xs whitespace-pre-wrap">{generatedOutput.notes}</p>
                  </div>
                )}
                {generatedOutput.generatedCode.map((file, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="p-3 bg-muted/50 border-b flex justify-between items-center">
                      <span className="font-mono text-sm font-medium">{file.fileName}</span>
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{file.language}</span>
                    </div>
                    <SyntaxHighlighter 
                      code={file.code} 
                      language={file.language.includes('html') ? 'html' : (file.language.includes('css') ? 'css' : 'javascript')} 
                      className="max-h-[400px]"
                    />
                  </div>
                ))}
                {generatedOutput.previewUrl && (
                   <Button variant="outline" asChild className="w-full mt-2">
                     <a href={generatedOutput.previewUrl} target="_blank" rel="noopener noreferrer">View Live Preview</a>
                   </Button>
                )}
                 <div className="mt-4 p-3 border border-dashed rounded-md text-xs text-center text-muted-foreground bg-muted/20">
                    <p><strong>Note:</strong> Figma-to-code is a complex feature. The current output is a placeholder/simplified version. Full conversion logic is still under development.</p>
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
