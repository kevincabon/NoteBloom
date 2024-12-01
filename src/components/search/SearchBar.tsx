import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TagFilter } from "@/components/tags/TagFilter";
import { Tag } from "@/types/tag";

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedTags: Tag[];
  onSelectTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
  className?: string;
}

export const SearchBar = ({
  search,
  onSearchChange,
  selectedTags,
  onSelectTag,
  onRemoveTag,
  className,
}: SearchBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("search.placeholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <TagFilter
        selectedTags={selectedTags}
        onSelectTag={onSelectTag}
        onRemoveTag={onRemoveTag}
      />
    </div>
  );
};
