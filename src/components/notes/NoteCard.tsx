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
import { Edit } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onMove: (note: Note) => void;
}

export const NoteCard = ({ note, onEdit, onDelete, onMove }: NoteCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const formattedContent = formatContent(note.content || "");

  const handleCardClick = (e: React.MouseEvent) => {
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
        <NoteHeader note={note} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />
        
        <div className="max-h-[200px] overflow-hidden relative">
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-note-50 dark:from-note-800 to-transparent" />
          <NoteContent 
            content={formattedContent} 
            audioUrl={note.audio_url}
            images={note.images}
          />
        </div>

        <NoteMetadata
          links={note.links}
          email={note.email}
          phone={note.phone}
        />

        <NoteTimestamps createdAt={note.created_at} updatedAt={note.updated_at} />
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[90vw] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader className="space-y-4">
            <div className="flex justify-between items-start">
              <SheetTitle className="text-xl font-bold">{note.title}</SheetTitle>
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
            </div>
            {note.folder_id && note.folder_name && (
              <div className="flex items-center gap-2">
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
              className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none"
            />
            <div className="mt-4 pt-4 border-t">
              <NoteTimestamps createdAt={note.created_at} updatedAt={note.updated_at} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};