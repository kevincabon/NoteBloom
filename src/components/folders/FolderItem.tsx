import { Button } from "@/components/ui/button";
import { Folder, MoreVertical, FolderEdit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FolderType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  color: string;
}

interface FolderItemProps {
  folder: FolderType;
  onSelect: (folderId: string) => void;
  onEdit: (folder: FolderType) => void;
  onDelete: (folderId: string) => void;
}

export const FolderItem = ({ folder, onSelect, onEdit, onDelete }: FolderItemProps) => {
  return (
    <div className="flex items-center group">
      <Button
        variant="ghost"
        className="flex-1 justify-start"
        onClick={() => onSelect(folder.id)}
      >
        <Folder className="h-4 w-4 mr-2" style={{ color: folder.color }} />
        <span style={{ color: folder.color }}>{folder.name}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(folder)}>
            <FolderEdit className="h-4 w-4 mr-2" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(folder.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};