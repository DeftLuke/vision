
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
import { Terminal, Sparkles, FileText, Copy } from "lucide-react";
import SyntaxHighlighter from "@/components/shared/SyntaxHighlighter"; // For displaying explanation if it contains code blocks

interface ExplainCodeOutput {
  explanation: string;
}

export default function CodeExplainerPage() {
  const [codeToExplain, setCodeToExplain] = useState<string>("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExplainCode = async () => {
    if (!codeToExplain.trim()) {
      toast({
        title: "Code is Empty",
        description: "Please paste some code to explain.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeToExplain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: ExplainCodeOutput = await response.json();
      if (!data.explanation) {
         throw new Error("Received no explanation from the server.");
      }
      setExplanation(data.explanation);
      toast({
        title: "Explanation Generated!",
        description: "The code explanation is ready.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Explanation Failed",
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
        description: "Explanation has been copied.",
      });
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Could not copy explanation.",
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
              <CardTitle className="text-2xl flex items-center"><FileText className="mr-2 h-6 w-6 text-primary" /> Code Explainer</CardTitle>
              <CardDescription>Paste your code snippet below to get a step-by-step explanation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="code-input" className="text-base font-semibold">Your Code</Label>
                <Textarea
                  id="code-input"
                  placeholder="Paste your code here (e.g., JavaScript, Python, Java, HTML, CSS)..."
                  value={codeToExplain}
                  onChange={(e) => setCodeToExplain(e.target.value)}
                  className="min-h-[200px] focus-visible:ring-primary font-mono text-sm"
                  disabled={isLoading}
                  aria-label="Code input for explanation"
                />
              </div>
              <Button 
                onClick={handleExplainCode} 
                disabled={isLoading || !codeToExplain.trim()}
                className="w-full" 
                aria-label="Explain Code"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? 'Explaining...' : 'Explain Code'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel: Output */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Explanation</CardTitle>
              <CardDescription>The AI-generated explanation of your code will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[200px]">
                  <LoadingSpinner size={32} />
                  <p className="text-muted-foreground">Generating explanation...</p>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive" className="min-h-[150px]">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Generating Explanation</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!isLoading && !error && (
                <>
                  {explanation ? (
                    <div className="relative">
                       <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-[-10px] right-[-10px] h-7 w-7 z-10"
                          onClick={() => copyToClipboard(explanation)}
                          aria-label="Copy explanation"
                          title="Copy explanation"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      <div className="p-4 rounded-md bg-secondary text-secondary-foreground overflow-auto text-sm max-h-[500px] min-h-[200px] prose dark:prose-invert prose-sm">
                        <div dangerouslySetInnerHTML={{ __html: explanation.replace(/\\n/g, '<br />').replace(/\n/g, '<br />') }} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[200px] flex flex-col items-center justify-center">
                      <FileText className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                      <p className="font-medium">Your explanation will appear here</p>
                      <p className="text-sm text-muted-foreground/70">Paste code and click "Explain Code".</p>
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
