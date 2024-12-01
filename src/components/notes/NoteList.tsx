import { Note } from "@/types/note";
import { NoteCard } from "./NoteCard";
import { useTranslation } from "react-i18next";

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onMove: (note: Note) => void;
}

export const NoteList = ({ notes, onEdit, onDelete, onMove }: NoteListProps) => {
  const { t } = useTranslation();

  if (notes.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {t('notes.empty', 'Ce dossier ne contient aucune note')}
      </div>
    );
  }

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