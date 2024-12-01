import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Pencil, Trash2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Folder } from "@/types/folder";

interface FolderTreeItemProps {
  folder: Folder;
  level: number;
  isSelected: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const FolderTreeItem = ({
  folder,
  level,
  isSelected,
  hasChildren,
  isExpanded,
  onSelect,
  onToggleExpand,
  onEdit,
  onDelete,
}: FolderTreeItemProps) => {
  const { t } = useTranslation();

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-md px-2 py-1 text-sm cursor-pointer",
        isSelected && "bg-accent",
        !isSelected && "hover:bg-accent/50"
      )}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
      onClick={handleClick}
    >
      {hasChildren && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-4 w-4 p-0 hover:bg-background/50",
            isExpanded && "rotate-90"
          )}
          onClick={handleExpandClick}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}
      {!hasChildren && <div className="w-4" />}
      
      <span
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: folder.color }}
      />
      
      <span className="flex-1 truncate">{folder.name}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-background/50"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("common.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("common.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
