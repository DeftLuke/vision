'use client';

import Image from 'next/image';

interface ImagePreviewProps {
  src: string;
  alt?: string;
}

export default function ImagePreview({ src, alt = "Uploaded UI screenshot" }: ImagePreviewProps) {
  return (
    <div className="mt-4 border border-border rounded-lg overflow-hidden shadow-sm aspect-video relative">
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="contain"
        className="p-2"
        data-ai-hint="interface design"
      />
    </div>
  );
}
