import { Note } from "@/types/note";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteForm } from "./NoteForm";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface NoteEditDialogProps {
  note: Note | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateNote: (updatedNote: Note) => void;
}

export const NoteEditDialog = ({
  note,
  isOpen,
  onOpenChange,
  onUpdateNote,
}: NoteEditDialogProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
    }
  }, [note]);

  if (!note) return null;

  const handleSubmit = (images: string[], audioUrl: string | null, folderId: string | null) => {
    const updatedNote = {
      ...note,
      title,
      content,
      images,
      audio_url: audioUrl,
      folder_id: folderId,
    };
    onUpdateNote(updatedNote);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('notes.edit')}</DialogTitle>
        </DialogHeader>
        <NoteForm
          title={title}
          content={content}
          editingNote={note}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onCancelEdit={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};