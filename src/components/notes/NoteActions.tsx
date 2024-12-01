import { Button } from "@/components/ui/button";
import { Edit, Trash2, FolderEdit } from "lucide-react";
import { Note } from "@/types/note";

interface NoteActionsProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onMove: (note: Note) => void;
}

export const NoteActions = ({ note, onEdit, onDelete, onMove }: NoteActionsProps) => {
  return (
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
  );
};