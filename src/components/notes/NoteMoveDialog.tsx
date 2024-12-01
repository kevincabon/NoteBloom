import { Note } from "@/types/note";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NoteMoveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNote: Note | null;
  onMoveNote: (note: Note, newFolderId: string | null) => void;
}

export const NoteMoveDialog = ({
  isOpen,
  onOpenChange,
  selectedNote,
  onMoveNote,
}: NoteMoveDialogProps) => {
  const { t } = useTranslation();

  const { data: folders = [] } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("notes.moveNote")}</DialogTitle>
          <DialogDescription>
            {t("notes.selectDestination")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => selectedNote && onMoveNote(selectedNote, null)}
          >
            {t("notes.allNotes")}
          </Button>
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => selectedNote && onMoveNote(selectedNote, folder.id)}
            >
              {folder.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};