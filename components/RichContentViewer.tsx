'use client';

interface RichContentViewerProps {
  content: string;
  className?: string;
}

export default function RichContentViewer({ content, className = '' }: RichContentViewerProps) {
  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      dir="auto"
    />
  );
}
