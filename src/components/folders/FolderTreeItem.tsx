import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Folder } from "@/types/folder";
import { FolderItem } from "./FolderItem";

interface FolderTreeItemProps {
  folder: Folder;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleExpand: () => void;
}

export const FolderTreeItem = ({
  folder,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleExpand,
}: FolderTreeItemProps) => {
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div
      className="flex items-center"
      style={{ paddingLeft: `${(folder.level || 0) * 1.5}rem` }}
    >
      {hasChildren ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          {folder.isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <div className="w-6" />
      )}
      <div className="flex-1">
        <FolderItem
          folder={folder}
          isSelected={isSelected}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};
