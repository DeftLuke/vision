
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean; // Added disabled prop
}

export default function PromptInput({ value, onChange, onSubmit, isLoading, disabled }: PromptInputProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="prompt-input" className="text-base font-semibold">Customization Prompt</Label>
      <Textarea
        id="prompt-input"
        placeholder="e.g., 'Make the navigation bar sticky', 'Use a dark theme for this section'"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] focus-visible:ring-primary"
        disabled={isLoading || disabled} // Use disabled prop here
      />
      <Button 
        onClick={onSubmit} 
        disabled={isLoading || disabled || !value.trim()} // Also consider disabled prop for the button
        className="w-full" 
        aria-label="Generate Code with Prompt"
      >
        <Send className="mr-2 h-4 w-4" />
        Generate Code
      </Button>
    </div>
  );
}
