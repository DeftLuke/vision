
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter';
import { Copy, FileText, Palette, Braces, Eye, Maximize, Minimize } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GeneratedCode {
  html: string;
  tailwindCss: string;
  javaScript?: string;
}

interface CodeDisplayProps {
  code: GeneratedCode;
}

export default function CodeDisplay({ code }: CodeDisplayProps) {
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: `${type} code has been copied.`,
      });
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard.",
        variant: "destructive",
      });
      console.error('Failed to copy: ', err);
    });
  };

  const iframeSrcDoc = useMemo(() => {
    if (!code || !code.html || !code.tailwindCss) return '';
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body { margin: 0; font-family: sans-serif; background-color: #fff; }
          ${code.tailwindCss}
        </style>
      </head>
      <body>
        ${code.html}
      </body>
      </html>
    `;
  }, [code]);

  return (
    <div className={cn(
      "relative",
      isFullscreen && "fixed inset-0 z-50 bg-card text-card-foreground p-4 flex flex-col"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute z-20", // z-20 to be above tabs list if it overlaps
          isFullscreen ? "top-4 right-4 h-8 w-8" : "top-[-8px] right-[-8px] h-7 w-7" // Adjust if CodeDisplay is directly in CardContent (p-6 pt-0)
        )}
        onClick={() => setIsFullscreen(!isFullscreen)}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
      </Button>

      <Tabs defaultValue="html" className={cn("w-full", isFullscreen && "flex-1 flex flex-col mt-2")}>
        <TabsList className={cn(
          "grid w-full",
          code.javaScript ? "grid-cols-4" : "grid-cols-3", // Adjust grid based on JS presence
          isFullscreen && "shrink-0"
        )}>
          <TabsTrigger value="html" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
            <FileText className="mr-2 h-4 w-4" /> HTML
          </TabsTrigger>
          <TabsTrigger value="css" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
            <Palette className="mr-2 h-4 w-4" /> Tailwind CSS
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </TabsTrigger>
          {/* {code.javaScript && (
            <TabsTrigger value="js" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
              <Braces className="mr-2 h-4 w-4" /> JavaScript
            </TabsTrigger>
          )} */}
        </TabsList>

        <TabsContent value="html" className={cn("mt-2", isFullscreen && "flex-1 overflow-hidden")}>
          <div className={cn("relative", isFullscreen && "h-full")}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 z-10"
              onClick={() => copyToClipboard(code.html, 'HTML')}
              aria-label="Copy HTML code"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <SyntaxHighlighter code={code.html} language="html" className={cn(isFullscreen && "h-full w-full overflow-auto")} />
          </div>
        </TabsContent>

        <TabsContent value="css" className={cn("mt-2", isFullscreen && "flex-1 overflow-hidden")}>
           <div className={cn("relative", isFullscreen && "h-full")}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 z-10"
              onClick={() => copyToClipboard(code.tailwindCss, 'Tailwind CSS')}
              aria-label="Copy Tailwind CSS code"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <SyntaxHighlighter code={code.tailwindCss} language="css" className={cn(isFullscreen && "h-full w-full overflow-auto")} />
          </div>
        </TabsContent>

        <TabsContent value="preview" className={cn("mt-2", isFullscreen && "flex-1")}>
          <iframe
            srcDoc={iframeSrcDoc}
            title="Code Preview"
            className={cn(
              "w-full border rounded-md bg-white",
              isFullscreen ? "h-full" : "h-[500px] min-h-[300px]" // Adjusted normal height
            )}
            // sandbox="allow-scripts" // Add if JS execution in preview is desired and safe
          />
        </TabsContent>

        {/* {code.javaScript && (
          <TabsContent value="js" className={cn("mt-2", isFullscreen && "flex-1 overflow-hidden")}>
            <div className={cn("relative", isFullscreen && "h-full")}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 z-10"
                onClick={() => copyToClipboard(code.javaScript!, 'JavaScript')}
                aria-label="Copy JavaScript code"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <SyntaxHighlighter code={code.javaScript} language="javascript" className={cn(isFullscreen && "h-full w-full overflow-auto")} />
            </div>
          </TabsContent>
        )} */}
      </Tabs>
    </div>
  );
}
