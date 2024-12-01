import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Plus, Tag as TagIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/types/tag";
import { cn } from "@/lib/utils";

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
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {tags.map((tag) => {
                  const isSelected = selectedTags.some((t) => t.id === tag.id);
                  return (
                    <button
                      key={tag.id}
                      className={cn(
                        "flex items-center w-full gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent"
                      )}
                      onClick={() => {
                        onSelect(tag);
                        setOpen(false);
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1">{tag.name}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            )}
            {onCreate && tags.length < MAX_TAGS ? (
              <button
                className="flex items-center gap-2 w-full mt-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onCreate();
                  setOpen(false);
                }}
              >
                <Plus className="w-4 h-4" />
                <span>{t("tags.create")}</span>
              </button>
            ) : tags.length >= MAX_TAGS ? (
              <div className="text-sm text-muted-foreground px-2 py-1.5 mt-2">
                {t("tags.limitReached")}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
