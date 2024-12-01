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
import { AudioPlayer } from "./AudioPlayer";
import { Calendar, RefreshCw } from "lucide-react";

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

        {note.audio_url && (
          <div className="mb-4">
            <AudioPlayer url={note.audio_url} />
          </div>
        )}

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

        <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Créé le {new Intl.DateTimeFormat("fr-FR", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(note.created_at))}</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Modifié le {new Intl.DateTimeFormat("fr-FR", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(note.updated_at))}</span>
          </div>
        </div>
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
            {note.audio_url && (
              <div className="mb-6">
                <AudioPlayer url={note.audio_url} />
              </div>
            )}
            <div 
              className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
            {note.images && note.images.length > 0 && (
              <div className="mt-6">
                <ImageGallery images={note.images} />
              </div>
            )}
            <div className="flex flex-col gap-2 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Créé le {new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(note.created_at))}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Modifié le {new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(note.updated_at))}</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};