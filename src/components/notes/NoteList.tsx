import { Note } from "@/types/note";
import { NoteCard } from "./NoteCard";

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onMove: (note: Note) => void;
}

export const NoteList = ({ notes, onEdit, onDelete, onMove }: NoteListProps) => {
  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </div>
  );
};