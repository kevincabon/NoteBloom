import { Note } from "@/types/note";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteForm } from "./NoteForm";
import { useTranslation } from "react-i18next";

interface NoteEditDialogProps {
  note: Note | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateNote: (images: string[], audioUrl: string | null) => void;
}

export const NoteEditDialog = ({
  note,
  isOpen,
  onOpenChange,
  onUpdateNote,
}: NoteEditDialogProps) => {
  const { t } = useTranslation();

  if (!note) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('notes.edit')}</DialogTitle>
        </DialogHeader>
        <NoteForm
          title={note.title}
          content={note.content || ""}
          editingNote={note}
          onTitleChange={() => {}}
          onContentChange={() => {}}
          onCancelEdit={() => onOpenChange(false)}
          onSubmit={onUpdateNote}
        />
      </DialogContent>
    </Dialog>
  );
};