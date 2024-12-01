import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Plus, Tag as TagIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/types/tag";
import { cn } from "@/lib/utils";
import { useRoleLimits } from "@/hooks/useRoleLimits";
import { LimitUsage } from "@/components/ui/LimitUsage";

const MAX_TAGS = 8;

interface TagPickerProps {
  tags: Tag[];
  selectedTags: Tag[];
  onSelect: (tag: Tag) => void;
  onCreate?: () => void;
  className?: string;
}

export const TagPicker = ({
  tags = [],
  selectedTags = [],
  onSelect,
  onCreate,
  className,
}: TagPickerProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { limits, canCreateMoreTags } = useRoleLimits();

  const showCreateButton = onCreate && canCreateMoreTags(tags.length);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className={cn("justify-between", className)}
      >
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4" />
          <span>{t("tags.addToNote")}</span>
        </div>
      </Button>
      {open && (
        <div className="absolute z-[9999] w-[200px] mt-2 rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-2">
            {tags.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2">
                {t("tags.noTags")}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="max-h-[200px] overflow-y-auto">
                  {tags.map((tag) => {
                    const isSelected = selectedTags.some((t) => t.id === tag.id);
                    return (
                      <Button
                        key={tag.id}
                        variant={isSelected ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => onSelect(tag)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {tag.name}
                      </Button>
                    );
                  })}
                </div>
                {limits?.max_tags && (
                  <LimitUsage
                    current={tags.length}
                    max={limits.max_tags}
                    className="mt-2 px-2"
                  />
                )}
              </div>
            )}
            {showCreateButton && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setOpen(false);
                  onCreate();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("tags.createNew")}
              </Button>
            )}
            {!showCreateButton && tags.length >= (limits?.max_tags ?? 0) && (
              <div className="text-sm text-muted-foreground p-2 border-t mt-2">
                {t("limits.maxTagsReached")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
