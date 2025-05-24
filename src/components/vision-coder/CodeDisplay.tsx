'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter';
import { Copy, FileText, Palette, Braces } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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

  return (
    <Tabs defaultValue="html" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="html" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
          <FileText className="mr-2 h-4 w-4" /> HTML
        </TabsTrigger>
        <TabsTrigger value="css" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
          <Palette className="mr-2 h-4 w-4" /> Tailwind CSS
        </TabsTrigger>
        {/* {code.javaScript && (
          <TabsTrigger value="js">
            <Braces className="mr-2 h-4 w-4" /> JavaScript
          </TabsTrigger>
        )} */}
      </TabsList>
      <TabsContent value="html" className="mt-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 z-10"
            onClick={() => copyToClipboard(code.html, 'HTML')}
            aria-label="Copy HTML code"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <SyntaxHighlighter code={code.html} language="html" />
        </div>
      </TabsContent>
      <TabsContent value="css" className="mt-2">
         <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 z-10"
            onClick={() => copyToClipboard(code.tailwindCss, 'Tailwind CSS')}
            aria-label="Copy Tailwind CSS code"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <SyntaxHighlighter code={code.tailwindCss} language="css" />
        </div>
      </TabsContent>
      {/* {code.javaScript && (
        <TabsContent value="js">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 z-10"
              onClick={() => copyToClipboard(code.javaScript!, 'JavaScript')}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <SyntaxHighlighter code={code.javaScript} language="javascript" />
          </div>
        </TabsContent>
      )} */}
    </Tabs>
  );
}
