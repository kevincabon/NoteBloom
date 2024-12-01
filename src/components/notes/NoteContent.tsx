import { ImageGallery } from "./ImageGallery";
import { AudioPlayer } from "./AudioPlayer";
import { cn } from "@/lib/utils";

interface NoteContentProps {
  content: string;
  audioUrl?: string | null;
  images?: string[];
  className?: string;
}

export const NoteContent = ({ content, audioUrl, images, className }: NoteContentProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {audioUrl && (
        <div className="mb-4">
          <AudioPlayer url={audioUrl} />
        </div>
      )}
      <div 
        className={cn("prose dark:prose-invert max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {images && images.length > 0 && (
        <div className="mt-4">
          <ImageGallery images={images} />
        </div>
      )}
    </div>
  );
};