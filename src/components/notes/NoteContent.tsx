import { ImageGallery } from "./ImageGallery";
import { AudioPlayer } from "./AudioPlayer";
import { cn } from "@/lib/utils";
import '@/styles/taskList.css';
import '@/styles/editor.css';
import { useEffect, useRef } from 'react';

interface NoteContentProps {
  content: string;
  audioUrl?: string | null;
  images?: string[];
  className?: string;
  fullContent?: boolean;
}

export const NoteContent = ({ content, audioUrl, images, className, fullContent = false }: NoteContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Désactiver toutes les cases à cocher après le rendu
    if (contentRef.current) {
      const checkboxes = contentRef.current.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.setAttribute('disabled', 'true');
      });
    }
  }, [content]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {audioUrl && (
        <div className="mb-4">
          <AudioPlayer url={audioUrl} />
        </div>
      )}
      <div 
        className={cn(
          "note-content prose dark:prose-invert max-w-none",
          !fullContent && "line-clamp-4"
        )}
        dangerouslySetInnerHTML={{ __html: content }}
        ref={contentRef}
      />
      {images && images.length > 0 && (
        <div className="mt-4">
          <ImageGallery images={images} />
        </div>
      )}
    </div>
  );
};