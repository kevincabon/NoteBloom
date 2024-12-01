import { Button } from "@/components/ui/button";
import { Folder as FolderIcon, Pencil as PencilIcon, Trash as TrashIcon, Users as UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useState } from "react";

interface FolderItemProps {
  folder: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
    isVirtual?: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const FolderItem = ({
  folder,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: FolderItemProps) => {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div
        className={cn(
          "group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent",
          isSelected && "bg-accent"
        )}
      >
        <button
          className="flex items-center space-x-2 flex-1"
          onClick={onSelect}
        >
          <div className="relative">
            {folder.icon === "users" ? (
              <UsersIcon className="w-4 h-4 text-muted-foreground" />
            ) : (
              <FolderIcon 
                className="w-4 h-4" 
                style={{ color: folder.color || 'var(--muted-foreground)' }}
              />
            )}
            {folder.color && !folder.icon && (
              <div 
                className="absolute -right-1 -top-1 w-2 h-2 rounded-full" 
                style={{ backgroundColor: folder.color }}
              />
            )}
          </div>
          <span>{folder.name}</span>
        </button>

        {!folder.isVirtual && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {onDelete && (
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={onDelete}
          title={t("delete.folder.title")}
          description={t("delete.folder.description")}
        />
      )}
    </>
  );
};