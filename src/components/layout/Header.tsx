
'use client';

import { Terminal, ImageIcon, Code2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Vision Coder', icon: Code2 },
    { href: '/text-to-image', label: 'Text-to-Image', icon: ImageIcon },
  ];

  return (
    <header className="py-4 px-6 bg-card border-b border-border/70 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">AI Studio</h1>
        </div>
        <nav>
          <ul className="flex items-center gap-2 sm:gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
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
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
