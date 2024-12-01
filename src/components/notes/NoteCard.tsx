import { Note } from "@/types/note";
import { Card } from "@/components/ui/card";
import { formatContent } from "@/utils/contentParser";
import { ImageGallery } from "./ImageGallery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { NoteActions } from "./NoteActions";
import { NoteMetadata } from "./NoteMetadata";
import { FolderBadge } from "./FolderBadge";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onMove: (note: Note) => void;
}

export const NoteCard = ({ note, onEdit, onDelete, onMove }: NoteCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: folder } = useQuery({
    queryKey: ['folder', note.folder_id],
    queryFn: async () => {
      if (!note.folder_id) return null;
      const { data } = await supabase
        .from('folders')
        .select('name, color')
        .eq('id', note.folder_id)
        .single();
      return data;
    },
    enabled: !!note.folder_id,
  });

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('a')) {
      setIsOpen(true);
    }
  };

  const formattedContent = formatContent(note.content || "");

  return (
    <>
      <Card 
        className="p-6 note-card cursor-pointer hover:shadow-md transition-all duration-300 fade-in"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{note.title}</h3>
            {folder && (
              <FolderBadge name={folder.name} color={folder.color} />
            )}
          </div>
          <NoteActions
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
          />
        </div>
        <div 
          className="text-muted-foreground line-clamp-3"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />

        <ImageGallery images={note.images || []} />

        <NoteMetadata
          links={note.links}
          email={note.email}
          phone={note.phone}
        />

        <time className="text-sm text-muted-foreground mt-4 block">
          {new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(note.created_at))}
        </time>
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[90vw] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{note.title}</SheetTitle>
            {folder && (
              <FolderBadge name={folder.name} color={folder.color} />
            )}
          </SheetHeader>
          <div className="mt-6">
            <div 
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
            {note.images && note.images.length > 0 && (
              <div className="mt-6">
                <ImageGallery images={note.images} />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};