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
        
        <NoteContent 
          content={formattedContent} 
          audioUrl={note.audio_url}
          images={note.images}
        />

        <NoteMetadata
          links={note.links}
          email={note.email}
          phone={note.phone}
        />

        <NoteTimestamps createdAt={note.created_at} updatedAt={note.updated_at} />
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[90vw] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{note.title}</SheetTitle>
            {note.folder_id && (
              <FolderBadge name={note.folder_name || ""} color={note.folder_color || "#e5e5e5"} />
            )}
          </SheetHeader>
          <div className="mt-6">
            <NoteContent 
              content={formattedContent} 
              audioUrl={note.audio_url}
              images={note.images}
            />
            <NoteTimestamps createdAt={note.created_at} updatedAt={note.updated_at} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};