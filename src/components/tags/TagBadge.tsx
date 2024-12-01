import { Tag } from "@/types/tag";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  className?: string;
}

export const TagBadge = ({ tag, onRemove, className }: TagBadgeProps) => {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 pr-1",
        className
      )}
      style={{
        backgroundColor: tag.color ? `${tag.color}20` : undefined,
        color: tag.color,
      }}
    >
      {tag.name}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
};
