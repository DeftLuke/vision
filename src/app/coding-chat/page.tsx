
'use client';

import React, { useState, FormEvent } from "react";
import Header from "@/components/layout/Header";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Bot, Send, Copy } from "lucide-react";
import SyntaxHighlighter from "@/components/shared/SyntaxHighlighter"; // For displaying code in response

interface CodingChatOutput {
  assistantResponse: string;
}

export default function CodingChatPage() {
  const [userMessage, setUserMessage] = useState<string>("");
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    if (!userMessage.trim()) {
      toast({
        title: "Message is Empty",
        description: "Please type your coding question.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAssistantResponse(null);

    try {
      const response = await fetch('/api/coding-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: CodingChatOutput = await response.json();
      setAssistantResponse(data.assistantResponse);
      // toast({ title: "Response Received!" }); // Optional: can be noisy for chat

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Error Getting Response",
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
        <Card className="shadow-lg w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><Bot className="mr-2 h-6 w-6 text-primary" /> AI Coding Assistant</CardTitle>
            <CardDescription>Ask your programming questions and get help from the AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="user-message" className="text-base font-semibold">Your Question</Label>
                <Textarea
                  id="user-message"
                  placeholder="e.g., How do I center a div in Tailwind CSS? or Explain JavaScript closures."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  className="min-h-[100px] focus-visible:ring-primary mt-1"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>
              <Button 
                type="submit"
                disabled={isLoading || !userMessage.trim()}
                className="w-full md:w-auto" 
                aria-label="Send message to AI assistant"
              >
                <Send className="mr-2 h-4 w-4" />
                {isLoading ? 'Thinking...' : 'Ask Assistant'}
              </Button>
            </form>

            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2 py-8 min-h-[150px]">
                <LoadingSpinner size={32} />
                <p className="text-muted-foreground">AI is preparing your answer...</p>
              </div>
            )}
            {error && !isLoading && (
              <Alert variant="destructive" className="min-h-[100px]">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!isLoading && !error && assistantResponse && (
              <div className="mt-6 space-y-3">
                <Label className="text-base font-semibold">AI's Response</Label>
                 <div className="relative p-4 rounded-md bg-secondary text-secondary-foreground overflow-auto text-sm min-h-[150px] prose dark:prose-invert prose-sm max-w-none">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 z-10"
                      onClick={() => copyToClipboard(assistantResponse)}
                      aria-label="Copy response"
                      title="Copy response"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {/* Basic handling for markdown-like newlines for now. 
                        A proper markdown renderer would be better for full formatting. */}
                    <div dangerouslySetInnerHTML={{ __html: assistantResponse.replace(/```([\s\S]*?)```/g, (match, code) => `<pre class="bg-muted p-2 rounded-md overflow-x-auto"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`).replace(/\n/g, '<br />') }} />
                </div>
              </div>
            )}
             {!isLoading && !error && !assistantResponse && !userMessage && (
                <div className="mt-6 text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 min-h-[150px] flex flex-col items-center justify-center">
                    <Bot className="w-10 h-10 mb-2 mx-auto text-muted-foreground/40" />
                    <p className="font-medium">Ask the AI anything!</p>
                    <p className="text-sm text-muted-foreground/70">Type your coding question above.</p>
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
