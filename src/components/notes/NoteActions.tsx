import { Button } from "@/components/ui/button";
import { Edit, Trash2, Share2 } from "lucide-react";
import { Note } from "@/types/note";
import { useState } from "react";
import { NoteShareDialog } from "./NoteShareDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useTranslation } from "react-i18next";

interface NoteActionsProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export const NoteActions = ({
  note,
  onEdit,
  onDelete,
}: NoteActionsProps) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <div className="flex gap-2">
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
            setShowShareDialog(true);
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteDialog(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <NoteShareDialog
        note={note}
        isOpen={showShareDialog}
        onOpenChange={setShowShareDialog}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => onDelete(note.id)}
        title={t("delete.note.title")}
        description={t("delete.note.description")}
      />
    </>
  );
};