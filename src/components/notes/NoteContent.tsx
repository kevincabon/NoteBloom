import { ImageGallery } from "./ImageGallery";
import { AudioPlayer } from "./AudioPlayer";

interface NoteContentProps {
  content: string;
  audioUrl?: string | null;
  images?: string[];
}

export const NoteContent = ({ content, audioUrl, images }: NoteContentProps) => {
  return (
    <div className="space-y-4">
      {audioUrl && (
        <div className="mb-4">
          <AudioPlayer url={audioUrl} />
        </div>
      )}
      <div 
        className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none"
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