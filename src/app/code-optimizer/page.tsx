
'use client';

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Wand2, Copy } from "lucide-react";
import SyntaxHighlighter from "@/components/shared/SyntaxHighlighter";

interface OptimizeCodeOutput {
  optimizedCode: string;
}

type SupportedLanguages = "javascript" | "typescript" | "python";

export default function CodeOptimizerPage() {
  const [codeToOptimize, setCodeToOptimize] = useState<string>("");
  const [language, setLanguage] = useState<SupportedLanguages>("javascript");
  const [optimizedCode, setOptimizedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOptimizeCode = async () => {
    if (!codeToOptimize.trim()) {
      toast({
        title: "Code is Empty",
        description: "Please paste some code to optimize.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setOptimizedCode(null);

    try {
      const response = await fetch('/api/optimize-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeToOptimize, language }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: OptimizeCodeOutput = await response.json();
      if (!data.optimizedCode) {
         throw new Error("Received no optimized code from the server.");
      }
      setOptimizedCode(data.optimizedCode);
      toast({
        title: "Code Optimized!",
        description: "The optimized code is ready.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Optimization Failed",
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
        description: "Optimized code has been copied.",
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
              <CardTitle className="text-2xl flex items-center"><Wand2 className="mr-2 h-6 w-6 text-primary" /> Code Optimizer / Refactorer</CardTitle>
              <CardDescription>Paste your code, select the language, and get an optimized or refactored version.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="language-select" className="text-base font-semibold">Language</Label>
                <Select onValueChange={(value) => setLanguage(value as SupportedLanguages)} value={language} disabled={isLoading}>
                  <SelectTrigger id="language-select" className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    {/* Add more languages as needed */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="code-input" className="text-base font-semibold">Your Code</Label>
                <Textarea
                  id="code-input"
                  placeholder={`Paste your ${language} code here...`}
                  value={codeToOptimize}
                  onChange={(e) => setCodeToOptimize(e.target.value)}
                  className="min-h-[200px] focus-visible:ring-primary font-mono text-sm"
                  disabled={isLoading}
                  aria-label="Code input for optimization"
                />
              </div>
              <Button 
                onClick={handleOptimizeCode} 
                disabled={isLoading || !codeToOptimize.trim()}
                className="w-full" 
                aria-label="Optimize Code"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? 'Optimizing...' : 'Optimize Code'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel: Output */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Optimized Code</CardTitle>
              <CardDescription>The AI-generated optimized/refactored code will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[200px]">
                  <LoadingSpinner size={32} />
                  <p className="text-muted-foreground">Optimizing code...</p>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive" className="min-h-[150px]">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Optimizing Code</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!isLoading && !error && (
                <>
                  {optimizedCode ? (
                     <div className="relative">
                       <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 z-10" // Adjusted for SyntaxHighlighter padding
                          onClick={() => copyToClipboard(optimizedCode)}
                          aria-label="Copy optimized code"
                          title="Copy optimized code"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <SyntaxHighlighter code={optimizedCode} language={language === 'typescript' ? 'javascript' : language} /> 
                        {/* Using 'javascript' for tsx highlighting for now */}
                      </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[200px] flex flex-col items-center justify-center">
                      <Wand2 className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                      <p className="font-medium">Your optimized code will appear here</p>
                      <p className="text-sm text-muted-foreground/70">Paste code, select language, and click "Optimize Code".</p>
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
