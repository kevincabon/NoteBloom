import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { Folder } from "@/types/folder";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FolderDeleteDialogProps {
  folder: Folder;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (folderId: string) => Promise<void>;
  subFoldersCount: number;
  notesCount: number;
}

export function FolderDeleteDialog({
  folder,
  isOpen,
  onClose,
  onConfirm,
  subFoldersCount,
  notesCount,
}: FolderDeleteDialogProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(folder.id);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("folders.delete")}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div>{t("folders.deleteConfirmation", { name: folder.name })}</div>
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="font-medium">{t("folders.deleteDetails")}:</div>
                <ul className="list-disc list-inside space-y-1">
                  {subFoldersCount > 0 && (
                    <li>
                      {t("folders.subFoldersCount", { count: subFoldersCount })}
                    </li>
                  )}
                  {notesCount > 0 && (
                    <li>{t("folders.notesCount", { count: notesCount })}</li>
                  )}
                </ul>
              </div>
              <div className="text-destructive">
                {t("folders.deleteWarning")}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.deleting")}
              </>
            ) : (
              t("common.delete")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
