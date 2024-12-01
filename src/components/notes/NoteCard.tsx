import { Note } from "@/types/note";
import { Card } from "@/components/ui/card";
import { formatContent } from "@/utils/contentParser";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { NoteMetadata } from "./NoteMetadata";
import { NoteHeader } from "./NoteHeader";
import { NoteContent } from "./NoteContent";
import { NoteTimestamps } from "./NoteTimestamps";
import { FolderBadge } from "./FolderBadge";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";

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
  const formattedContent = formatContent(note.content || "");

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[role="dialog"]')) return;
    if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('a')) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Card 
        className="p-6 note-card cursor-pointer hover:shadow-md transition-all duration-300 fade-in"
        onClick={handleCardClick}
      >
        <NoteHeader 
          note={note} 
          onEdit={onEdit}
          onDelete={onDelete}
          isSharedView={isSharedView}
        />
        <div className="mt-4">
          <NoteContent content={formattedContent} />
        </div>
        <div className="mt-4">
          <NoteMetadata 
            links={note.links}
            email={note.email}
            phone={note.phone}
            images={note.images}
            isSharedView={isSharedView}
          />
        </div>
        <div className="mt-2">
          <NoteTimestamps 
            createdAt={note.created_at}
            updatedAt={note.updated_at}
            owner={note.owner}
          />
        </div>
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[90vw] sm:max-w-[600px] overflow-y-auto" aria-describedby="note-content-description">
          <SheetHeader className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <SheetTitle className="text-xl font-bold">{note.title}</SheetTitle>
              <div id="note-content-description" className="sr-only">
                Contenu détaillé de la note {note.title}
              </div>
              <div className="flex items-center gap-2">
                {!isSharedView && onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsOpen(false);
                      onEdit(note);
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
            {note.folder_id && note.folder_name && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Dossier:</span>
                <FolderBadge name={note.folder_name} color={note.folder_color || "#e5e5e5"} />
              </div>
            )}
          </SheetHeader>
          <div className="mt-6">
            <NoteContent 
              content={formattedContent} 
              audioUrl={note.audio_url}
              images={note.images}
              className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none no-truncate"
              fullContent
            />
            <div className="mt-4 pt-4 border-t">
              <NoteMetadata
                links={note.links}
                email={note.email}
                phone={note.phone}
                images={note.images}
                isSharedView={isSharedView}
              />
              <NoteTimestamps 
                createdAt={note.created_at}
                updatedAt={note.updated_at}
                owner={isSharedView ? note.owner : undefined}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};