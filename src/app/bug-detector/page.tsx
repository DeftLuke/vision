
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
import { Terminal, Bug, Sparkles, Copy } from "lucide-react";
// Consider using a proper markdown renderer if complex markdown is expected in analysis
// import ReactMarkdown from 'react-markdown'; 

interface BugDetectorOutput {
  analysis: string;
}

type SupportedLanguages = "javascript" | "typescript" | "python" | "java" | "csharp" | "php" | "ruby" | "go";


export default function BugDetectorPage() {
  const [codeToDebug, setCodeToDebug] = useState<string>("");
  const [language, setLanguage] = useState<SupportedLanguages>("javascript");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDetectBugs = async () => {
    if (!codeToDebug.trim()) {
      toast({
        title: "Code is Empty",
        description: "Please paste some code to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/debug-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeToDebug, language }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: BugDetectorOutput = await response.json();
      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete!",
        description: "Bug detection analysis is ready.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
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
              <CardTitle className="text-2xl flex items-center"><Bug className="mr-2 h-6 w-6 text-primary" /> AI Bug Detector</CardTitle>
              <CardDescription>Paste your code, select the language, and let AI find bugs and suggest fixes.</CardDescription>
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
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="code-input" className="text-base font-semibold">Your Code</Label>
                <Textarea
                  id="code-input"
                  placeholder={`Paste your ${language} code here to find bugs...`}
                  value={codeToDebug}
                  onChange={(e) => setCodeToDebug(e.target.value)}
                  className="min-h-[250px] focus-visible:ring-primary font-mono text-sm"
                  disabled={isLoading}
                  aria-label="Code input for bug detection"
                />
              </div>
              <Button 
                onClick={handleDetectBugs} 
                disabled={isLoading || !codeToDebug.trim()}
                className="w-full" 
                aria-label="Detect Bugs in Code"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? 'Analyzing...' : 'Detect Bugs'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel: Output */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Bug Analysis & Fixes</CardTitle>
              <CardDescription>AI-powered analysis of your code will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[200px]">
                  <LoadingSpinner size={32} />
                  <p className="text-muted-foreground">Analyzing code for bugs...</p>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive" className="min-h-[150px]">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error Analyzing Code</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!isLoading && !error && (
                <>
                  {analysis ? (
                    <div className="relative">
                       <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-[-10px] right-[-10px] h-7 w-7 z-10"
                          onClick={() => copyToClipboard(analysis)}
                          aria-label="Copy analysis"
                          title="Copy analysis"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      <div className="p-4 rounded-md bg-secondary text-secondary-foreground overflow-auto text-sm max-h-[600px] min-h-[250px] prose dark:prose-invert prose-sm max-w-none">
                        {/* Using dangerouslySetInnerHTML for simplicity with AI-generated Markdown. 
                            For production, a safer Markdown renderer is recommended. */}
                        <div dangerouslySetInnerHTML={{ __html: analysis.replace(/```([\s\S]*?)```/g, (match, code) => `<pre class="bg-muted p-2 rounded-md overflow-x-auto"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`).replace(/\n/g, '<br />') }} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[250px] flex flex-col items-center justify-center">
                      <Bug className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                      <p className="font-medium">Bug analysis will appear here</p>
                      <p className="text-sm text-muted-foreground/70">Paste code, select language, and click "Detect Bugs".</p>
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
