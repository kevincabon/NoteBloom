import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Note } from "@/types/note";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteCard } from "@/components/notes/NoteCard";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { useTranslation } from "react-i18next";
import { parseContent } from "@/utils/contentParser";

interface NotesContainerProps {
  notes: Note[];
  onCreateNote: (note: Omit<Note, "id" | "created_at" | "updated_at">) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesContainer = ({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}: NotesContainerProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isGuestMode } = useGuestMode();

  const handleCreateNote = async (images: string[]) => {
    if (!title.trim()) {
      toast({
        title: t("notes.errors.titleRequired"),
        variant: "destructive",
      });
      return;
    }

    const { links, email, phone } = parseContent(content);

    onCreateNote({
      title: title.trim(),
      content: content.trim(),
      links,
      phone,
      email,
      is_public: false,
      images,
    });

    setTitle("");
    setContent("");

    toast({
      title: t("notes.created"),
    });
  };

  const handleUpdateNote = async (images: string[]) => {
    if (!editingNote) return;

    const { links, email, phone } = parseContent(content);

    onUpdateNote({
      ...editingNote,
      title: title.trim(),
      content: content.trim(),
      links,
      phone,
      email,
      images,
    });

    setEditingNote(null);
    setTitle("");
    setContent("");

    toast({
      title: t("notes.updated"),
    });
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || "");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <NoteForm
        title={title}
        content={content}
        editingNote={editingNote}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
        onCancelEdit={() => {
          setEditingNote(null);
          setTitle("");
          setContent("");
        }}
      />

      <div className="space-y-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={startEditing}
            onDelete={onDeleteNote}
          />
        ))}
      </div>
    </div>
  );
};