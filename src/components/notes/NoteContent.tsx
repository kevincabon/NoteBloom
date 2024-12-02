import { ImageGallery } from "./ImageGallery";
import { AudioPlayer } from "./AudioPlayer";
import { cn } from "@/lib/utils";
import '@/styles/taskList.css';
import '@/styles/editor.css';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/types/note";

interface NoteContentProps {
  note: Note;
  readonly?: boolean;
  className?: string;
  fullContent?: boolean;
}

export const NoteContent = ({ note, readonly = false, className, fullContent = false }: NoteContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Désactiver toutes les cases à cocher après le rendu
    if (contentRef.current) {
      const checkboxes = contentRef.current.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.setAttribute('disabled', readonly ? 'true' : 'false');
      });
    }
  }, [note.content, readonly]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={note.is_locked ? 'locked' : 'unlocked'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className={cn("flex flex-col gap-4", className)}
      >
        {note.audio_url && (
          <div className="mb-4">
            <AudioPlayer url={note.audio_url} />
          </div>
        )}
        <div 
          className={cn(
            "note-content prose dark:prose-invert max-w-none",
            !fullContent && "line-clamp-4"
          )}
          dangerouslySetInnerHTML={{ __html: note.content || '' }}
          ref={contentRef}
        />
        {note.images && note.images.length > 0 && (
          <div className="mt-4">
            <ImageGallery images={note.images} />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};