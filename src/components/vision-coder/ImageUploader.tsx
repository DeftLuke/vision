
'use client';

import type { ChangeEvent, DragEvent, ClipboardEvent } from 'react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUpload: (file: File, dataUri: string) => void;
  isLoading?: boolean;
}

export default function ImageUploader({ onImageUpload, isLoading }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: `Skipping non-image file: ${file.name}. Please upload PNG, JPG, GIF, or WEBP.`,
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload(file, e.target.result as string);
      } else {
        toast({
          title: "File Read Error",
          description: `Could not read file: ${file.name}`,
          variant: "destructive",
        });
      }
    };
    reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: `Error reading file: ${file.name}`,
          variant: "destructive",
        });
    };
    reader.readAsDataURL(file);
  }, [onImageUpload, toast]);

  const processMultipleFiles = useCallback((files: FileList | File[]) => {
    let imageFound = false;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        processFile(file);
        imageFound = true;
      } else {
         toast({
            title: "Invalid File Type",
            description: `Skipping non-image file: ${file.name}.`,
            variant: "default",
          });
      }
    });
    if (!imageFound && files.length > 0) {
        toast({
            title: "No Valid Images",
            description: "No valid image files were found in your selection.",
            variant: "destructive",
        });
    }
  }, [processFile, toast]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processMultipleFiles(files);
    }
    // Reset the input value to allow uploading the same file again
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processMultipleFiles(files);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    const handlePaste = (event: globalThis.ClipboardEvent) => {
      if (isLoading) return;
      const items = event.clipboardData?.items;
      if (items) {
        const filesArray: File[] = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
              filesArray.push(file);
            }
          }
        }
        if (filesArray.length > 0) {
            processMultipleFiles(filesArray);
        } else {
            // Optionally, inform user if paste contained no images
            // toast({ title: "Paste Info", description: "No images found in pasted content." });
        }
      }
    };

    window.addEventListener('paste', handlePaste as EventListener);
    return () => {
      window.removeEventListener('paste', handlePaste as EventListener);
    };
  }, [isLoading, processMultipleFiles, toast]);

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ease-in-out",
        "flex flex-col items-center justify-center space-y-4 h-64",
        isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/70",
        isLoading ? "cursor-not-allowed opacity-70" : ""
      )}
      role="button"
      tabIndex={0}
      aria-label="Image upload area: drag & drop, click to select, or paste images"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple // Allow multiple file selection
        className="hidden"
        disabled={isLoading}
      />
      <UploadCloud className={cn("w-16 h-16", isDragging ? "text-primary" : "text-muted-foreground")} />
      <p className="text-muted-foreground">
        {isDragging ? "Drop image(s) here" : "Drag & drop, paste, or click to select image(s)"}
      </p>
      <p className="text-xs text-muted-foreground/80">PNG, JPG, GIF, WEBP accepted</p>
    </div>
  );
}
