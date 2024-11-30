import { Note } from "@/types/note";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

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
        {note.content}
      </p>
      <time className="text-sm text-muted-foreground mt-4 block">
        {new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(note.created_at))}
      </time>
    </Card>
  );
};