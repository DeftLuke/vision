import { Terminal } from 'lucide-react';

export default function Header() {
  return (
    <header className="py-4 px-6 shadow-md bg-card">
      <div className="container mx-auto flex items-center gap-2">
        <Terminal className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">VisionCoder</h1>
      </div>
    </header>
  );
}
