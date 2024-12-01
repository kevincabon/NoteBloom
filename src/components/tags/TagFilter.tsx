import { Tag } from "@/types/tag";
import { TagBadge } from "./TagBadge";
import { TagPicker } from "./TagPicker";
import { useTags } from "@/hooks/useTags";

interface TagFilterProps {
  selectedTags: Tag[];
  onSelectTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
}

export const TagFilter = ({
  selectedTags = [],
  onSelectTag,
  onRemoveTag,
}: TagFilterProps) => {
  const { tags = [], isLoading } = useTags();

  const handleSelect = (tag: Tag) => {
    if (onSelectTag) {
      onSelectTag(tag);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        {selectedTags?.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            onRemove={() => onRemoveTag(tag.id)}
          />
        ))}
        <TagPicker
          tags={[]}
          selectedTags={selectedTags || []}
          onSelect={handleSelect}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {selectedTags?.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          onRemove={() => onRemoveTag(tag.id)}
        />
      ))}
      <TagPicker
        tags={tags.filter(
          (tag) => !selectedTags?.some((t) => t.id === tag.id)
        )}
        selectedTags={selectedTags || []}
        onSelect={handleSelect}
      />
    </div>
  );
};
