import { Note } from "@/types/note";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteForm } from "./NoteForm";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface NoteEditDialogProps {
  note: Note | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateNote: (images: string[], audioUrl: string | null, folderId: string | null) => void;
}

export const NoteEditDialog = ({
  note,
  isOpen,
  onOpenChange,
  onUpdateNote,
}: NoteEditDialogProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  if (!note) return null;

  const handleSubmit = (images: string[], audioUrl: string | null, folderId: string | null) => {
    const updatedNote = {
      ...note,
      title,
      content,
    };
    onUpdateNote(images, audioUrl, folderId);
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