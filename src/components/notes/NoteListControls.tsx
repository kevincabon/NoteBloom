import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tag } from "@/types/tag";
import { TagFilter } from "@/components/tags/TagFilter";

interface NoteListControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  isGlobalSearch: boolean;
  onGlobalSearchChange: (value: boolean) => void;
  selectedTags: Tag[];
  onSelectTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
  showGlobalSearch?: boolean;
}

export const NoteListControls = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  isGlobalSearch,
  onGlobalSearchChange,
  selectedTags,
  onSelectTag,
  onRemoveTag,
  showGlobalSearch = true,
}: NoteListControlsProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("notes.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("notes.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">{t("notes.sortByDate")}</SelectItem>
            <SelectItem value="title">{t("notes.sortByTitle")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TagFilter
        selectedTags={selectedTags}
        onSelectTag={onSelectTag}
        onRemoveTag={onRemoveTag}
      />

      {showGlobalSearch && (
        <div className="flex items-center space-x-2">
          <Switch
            id="global-search"
            checked={isGlobalSearch}
            onCheckedChange={onGlobalSearchChange}
          />
          <Label htmlFor="global-search">{t("notes.searchInAllFolders")}</Label>
        </div>
      )}
    </div>
  );
};