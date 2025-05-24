
'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface SyntaxHighlighterProps {
  code: string;
  language: 'html' | 'css' | 'javascript';
  className?: string;
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ code, language, className }) => {
  
  const escapeHtml = (unsafe: string): string => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  const highlight = (codeToHighlight: string, lang: string): string => {
    let currentCode = escapeHtml(codeToHighlight);

    if (lang === 'html') {
      currentCode = currentCode.replace(/(&lt;\/?)([a-zA-Z0-9\-]+)(.*?\s*&gt;)/g, (match, p1, p2, p3) => {
        return `${p1}<span class="syntax-highlight-tag">${p2}</span>${p3}`;
      });
      currentCode = currentCode.replace(/([a-zA-Z0-9\-]+)=(&quot;.*?&quot;)/g, (match, p1, p2) => {
        return `<span class="syntax-highlight-attr">${p1}</span>=${p2}`;
      });
      currentCode = currentCode.replace(/(&lt;!--.*?--&gt;)/g, '<span class="syntax-highlight-comment">$1</span>');
    } else if (lang === 'css') {
      currentCode = currentCode.replace(/^([.#]?[a-zA-Z0-9\-\s_:,[\]="']+)({)/gm, (match, p1, p2) => {
        return `<span class="syntax-highlight-selector">${p1.trim()}</span>${p2}`;
      });
      currentCode = currentCode.replace(/([a-zA-Z0-9\-]+)\s*:\s*(.*?);/g, (match, p1, p2) => {
        return `<span class="syntax-highlight-property">${p1}</span>: ${p2};`;
      });
      currentCode = currentCode.replace(/(\/\*.*?\*\/)/gs, '<span class="syntax-highlight-comment">$1</span>');
    } else if (lang === 'javascript') {
      const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'import', 'export', 'from', 'class', 'extends', 'super', 'this', 'new', 'await', 'async', 'true', 'false', 'null', 'undefined'];
      const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
      currentCode = currentCode.replace(keywordRegex, '<span class="syntax-highlight-keyword">$1</span>');
      currentCode = currentCode.replace(/(\/\/.*?)(\n|$)/g, '<span class="syntax-highlight-comment">$1</span>$2');
      currentCode = currentCode.replace(/(\/\*.*?\*\/)/gs, '<span class="syntax-highlight-comment">$1</span>');
      currentCode = currentCode.replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="syntax-highlight-string">$1</span>');
    }
    return currentCode;
  };

  const [highlightedContent, setHighlightedContent] = React.useState('');

  React.useEffect(() => {
    setHighlightedContent(highlight(code, language));
  }, [code, language]);

  return (
    <pre
      className={cn(
        "p-4 rounded-md bg-secondary text-secondary-foreground overflow-auto text-sm max-h-[500px] min-h-[200px]",
        "font-mono",
        className
      )}
    >
      <code dangerouslySetInnerHTML={{ __html: highlightedContent }} />
    </pre>
  );
};

export default SyntaxHighlighter;
