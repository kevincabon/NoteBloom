import { Note } from "@/types/note";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Link, Mail, Phone } from "lucide-react";
import { formatContent } from "@/utils/contentParser";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export const NoteCard = ({ note, onEdit, onDelete }: NoteCardProps) => {
  return (
    <Card className="p-6 note-card cursor-pointer hover:shadow-md transition-all duration-300 fade-in">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium">{note.title}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(note)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground line-clamp-3">
        {formatContent(note.content || "")}
      </p>
      <div className="flex gap-4 mt-4">
        {note.links && note.links.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <a
                  href={`mailto:${note.email}`}
                  className="text-primary hover:underline"
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
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <a
                  href={`tel:${note.phone}`}
                  className="text-primary hover:underline"
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
  );
};