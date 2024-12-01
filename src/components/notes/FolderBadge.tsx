import { Folder } from "lucide-react";

interface FolderBadgeProps {
  name: string;
  color: string;
}

export const FolderBadge = ({ name, color }: FolderBadgeProps) => {
  return (
    <div className="flex items-center gap-2 text-sm" style={{ color }}>
      <Folder className="h-4 w-4" />
      <span>{name}</span>
    </div>
  );
};