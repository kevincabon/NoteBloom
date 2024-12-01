import { Note } from "@/types/note";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Link, Mail, Phone, FolderEdit } from "lucide-react";
import { formatContent } from "@/utils/contentParser";
import { ImageGallery } from "./ImageGallery";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onMove: (note: Note) => void;
}

export const NoteCard = ({ note, onEdit, onDelete, onMove }: NoteCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
          <h3 className="text-lg font-medium">{note.title}</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onMove(note);
              }}
            >
              <FolderEdit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div 
          className="text-muted-foreground line-clamp-3"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />

        <ImageGallery images={note.images || []} />

        <div className="flex gap-4 mt-4">
          {note.links && note.links.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer">
                    <Link className="h-4 w-4" />
                    {note.links.length}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <ul className="space-y-1">
                    {note.links.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {note.email && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer">
                    <Mail className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <a
                    href={`mailto:${note.email}`}
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {note.email}
                  </a>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {note.phone && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer">
                    <Phone className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <a
                    href={`tel:${note.phone}`}
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {note.phone}
                  </a>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
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
