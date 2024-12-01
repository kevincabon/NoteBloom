import { Note } from "@/types/note";
import { useMemo } from "react";

export const useLocalNotes = (
  notes: Note[],
  isGlobalSearch: boolean,
  searchQuery: string
) => {
  const localNotes = useMemo(() => {
    if (isGlobalSearch) return notes;
    
    return notes.filter((note) => {
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(searchLower) ||
        (note.content?.toLowerCase() || "").includes(searchLower)
      );
    });
  }, [notes, isGlobalSearch, searchQuery]);

  return { localNotes };
};