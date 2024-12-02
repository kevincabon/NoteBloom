import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Edit, X, Lock, Unlock } from "lucide-react";
import { Note } from "@/types/note";
import { NoteContent } from "./NoteContent";
import { NoteHeader } from "./NoteHeader";
import { NoteMetadata } from "./NoteMetadata";
import { NoteTimestamps } from "./NoteTimestamps";
import { formatContent } from "@/utils/contentParser";
import { cn } from "@/lib/utils";
import '@/styles/editor.css';
import { NoteLockDialog } from './NoteLockDialog';
import { NoteUnlockDialog } from './NoteUnlockDialog';
import { supabase } from "@/lib/supabase";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { useNote } from '@/hooks/useNote'; // Import the useNote hook

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
  isSharedView?: boolean;
}

export const NoteCard = ({ 
  note, 
  onEdit, 
  onDelete, 
  isSharedView = false 
}: NoteCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { note: updatedNote, isLoading, invalidateNote } = useNote(note.id); // Use the useNote hook
  const formattedContent = decryptedContent || formatContent(updatedNote?.content || note.content || "");
  const { t } = useTranslation();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[role="dialog"]')) return;
    if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('a')) {
      setIsOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    
    // Attendre que l'animation de fade out soit terminée avant de supprimer
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Animer la hauteur
    if (cardRef.current) {
      cardRef.current.style.height = `${cardRef.current.offsetHeight}px`;
      cardRef.current.offsetHeight; // Force reflow
      cardRef.current.style.height = '0';
    }
    
    // Attendre que l'animation de height soit terminée avant de supprimer
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onDelete(id);
  };

  const handleLockNote = async (noteId: string, passwordHash: string, encryptedContent: string) => {
    try {
      await supabase
        .from("notes")
        .update({
          is_locked: true,
          password_hash: passwordHash,
          encrypted_content: encryptedContent,
          content: null,
        })
        .eq("id", noteId);

      invalidateNote();
    } catch (error) {
      console.error("Error locking note:", error);
      throw error;
    }
  };

  const handleUnlockNote = async (decryptedContent: string) => {
    try {
      await supabase
        .from("notes")
        .update({
          is_locked: false,
          password_hash: null,
          encrypted_content: null,
          content: decryptedContent,
        })
        .eq("id", note.id);

      invalidateNote();
    } catch (error) {
      console.error("Error unlocking note:", error);
      throw error;
    }
  };

  const handleUnlockSuccess = async (content: string) => {
    try {
      await handleUnlockNote(content);
      
      setDecryptedContent(content);
    } catch (error) {
      console.error("Error unlocking note:", error);
      throw error;
    }
  };

  useEffect(() => {
    setDecryptedContent(null);
  }, [updatedNote?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 px-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
        <p className="text-center text-muted-foreground">
          {t("notes.loading")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={cardRef}
        className={cn(
          "transition-all duration-300 ease-in-out",
          isDeleting && "opacity-0 overflow-hidden"
        )}
      >
        <Card 
          className={cn(
            "p-6 note-card cursor-pointer hover:shadow-md transition-all duration-300",
            "animate-fade-in",
            updatedNote?.is_locked && !decryptedContent && "bg-muted"
          )}
          onClick={handleCardClick}
        >
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-3 w-full">
              <NoteHeader 
                note={updatedNote} 
                onEdit={onEdit}
                onDelete={(id) => handleDelete(id)}
                isSharedView={isSharedView}
                onLock={() => setShowLockDialog(true)}
                onUnlock={() => setShowUnlockDialog(true)}
              />
            </div>
          </div>
          <div className="mt-4 note-content">
            {!updatedNote?.is_locked ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <NoteContent note={updatedNote || note} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center gap-4 py-8 px-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20"
              >
                <Lock className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-center text-muted-foreground">
                  {t("notes.lock.status.locked")}
                </p>
              </motion.div>
            )}
          </div>
          <div className="mt-4">
            <NoteMetadata 
              links={updatedNote?.links}
              email={updatedNote?.email}
              phone={updatedNote?.phone}
              images={updatedNote?.images}
              isSharedView={isSharedView}
            />
          </div>
          <div className="mt-2">
            <NoteTimestamps 
              createdAt={updatedNote?.created_at}
              updatedAt={updatedNote?.updated_at}
              owner={updatedNote?.owner}
            />
          </div>
        </Card>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[90vw] sm:max-w-[600px] overflow-y-auto" aria-describedby="note-content-description">
          <SheetHeader className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <SheetTitle className="text-xl font-bold">{updatedNote?.title}</SheetTitle>
              <div id="note-content-description" className="sr-only">
                Contenu détaillé de la note {updatedNote?.title}
              </div>
              <div className="flex items-center gap-2">
                {!isSharedView && onEdit && !updatedNote?.is_locked && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsOpen(false);
                      onEdit(updatedNote);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {updatedNote?.folder_id && updatedNote?.folder_name && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Dossier:</span>
                <FolderBadge name={updatedNote?.folder_name} color={updatedNote?.folder_color || "#e5e5e5"} />
              </div>
            )}
          </SheetHeader>
          <div className="mt-6 note-content">
            {!updatedNote?.is_locked ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <NoteContent 
                  note={updatedNote || note}
                  className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none"
                  fullContent
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center gap-4 py-8 px-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20"
              >
                <Lock className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-center text-muted-foreground">
                  {t("notes.lock.status.locked")}
                </p>
              </motion.div>
            )}
            <div className="mt-4 pt-4 border-t">
              <NoteMetadata
                links={updatedNote?.links}
                email={updatedNote?.email}
                phone={updatedNote?.phone}
                images={updatedNote?.images}
                isSharedView={isSharedView}
              />
              <NoteTimestamps 
                createdAt={updatedNote?.created_at}
                updatedAt={updatedNote?.updated_at}
                owner={isSharedView ? updatedNote?.owner : undefined}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <NoteLockDialog
        note={updatedNote}
        isOpen={showLockDialog}
        onOpenChange={setShowLockDialog}
        onLockNote={handleLockNote}
      />

      <NoteUnlockDialog
        note={updatedNote}
        isOpen={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        onUnlockSuccess={handleUnlockSuccess}
      />
    </>
  );
};