
'use client';

import { Terminal, ImageIcon, Code2, FileText, Wand2, DraftingCompass, Globe2, ComponentIcon as ReactComponentIcon, ScanText, Bot, Bug, FileCode2 as MarkdownIcon, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';


export default function Header() {
  const pathname = usePathname();

  const mainNavLinks = [
    { href: '/', label: 'Vision Coder', icon: Code2, description: "Image to HTML/CSS" },
    { href: '/text-to-image', label: 'Text-to-Image', icon: ImageIcon, description: "Generate images from text" },
  ];

  const toolsNavLinks = [
    { href: '/code-explainer', label: 'Code Explainer', icon: FileText, description: "Understand code snippets" },
    { href: '/code-optimizer', label: 'Code Optimizer', icon: Wand2, description: "Refactor & improve code" },
    { href: '/wireframe-to-code', label: 'Wireframe Coder', icon: DraftingCompass, description: "Sketch to HTML/CSS" },
    { href: '/text-to-website', label: 'Text-to-Website', icon: Globe2, description: "Full website from text" },
    { href: '/text-to-react-component', label: 'Text-to-Component', icon: ReactComponentIcon, description: "Generate React components" },
    { href: '/image-to-text', label: 'Image-to-Text', icon: ScanText, description: "OCR & Image Captioning" },
    { href: '/coding-chat', label: 'Coding Chat', icon: Bot, description: "AI Coding Assistant" },
    { href: '/bug-detector', label: 'Bug Detector', icon: Bug, description: "Find Bugs in Code" },
    { href: '/markdown-converter', label: 'Markdown to HTML', icon: MarkdownIcon, description: "Convert Markdown to HTML" },
    { href: '/design-feedback', label: 'Design Feedback', icon: Lightbulb, description: "Get UI/UX Feedback" },
  ];

  const allLinks = [...mainNavLinks, ...toolsNavLinks];

  return (
    <header className="py-3 px-4 sm:px-6 bg-card border-b border-border/70 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Terminal className="w-7 h-7 sm:w-8 sm:h-8 text-primary group-hover:animate-pulse" />
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">AI Studio</h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {mainNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground",
                toolsNavLinks.some(l => pathname === l.href) && "bg-primary/10 text-primary"
              )}>
                Developer Tools
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 max-h-[70vh] overflow-y-auto"> {/* Increased width and added scroll */}
              <DropdownMenuLabel>More AI Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {toolsNavLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className={cn(pathname === link.href && "bg-accent")}>
                  <Link href={link.href} className="flex items-start gap-2.5 w-full p-2.5"> {/* Adjusted padding and gap */}
                    <link.icon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" /> {/* Adjusted size and alignment */}
                    <div className="flex flex-col">
                      <span className="font-medium leading-snug">{link.label}</span>
                      <span className="text-xs text-muted-foreground leading-tight">{link.description}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-[80vh] overflow-y-auto">
              {allLinks.map((link) => (
                 <DropdownMenuItem key={link.href} asChild className={cn(pathname === link.href && "bg-accent")}>
                  <Link href={link.href} className="flex items-center gap-2 w-full">
                    <link.icon className="h-4 w-4 mr-1 text-muted-foreground" />
                     <span>{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
