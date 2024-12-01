import { Note } from "@/types/note";
import { Tag } from "@/types/tag";
import { useMemo } from "react";

export const useLocalNotes = (
  notes: Note[],
  isGlobalSearch: boolean,
  searchQuery: string,
  selectedTags: Tag[] = []
) => {
  const localNotes = useMemo(() => {
    if (!notes) return [];
    
    let filtered = notes;

    // Filtrer par recherche
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((note) => {
        return (
          note.title.toLowerCase().includes(searchLower) ||
          (note.content?.toLowerCase() || "").includes(searchLower)
        );
      });
    }

    // Filtrer par tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => {
        const noteTags = note.tags || [];
        return selectedTags.every(tag => 
          noteTags.some(noteTag => noteTag.id === tag.id)
        );
      });
    }

    return filtered;
  }, [notes, searchQuery, selectedTags]);

  return { localNotes };
};