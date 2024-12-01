import { useState, useEffect } from "react";
import { Note } from "@/types/note";

export const useLocalNotes = (
  initialNotes: Note[],
  isGlobalSearch: boolean,
  searchQuery: string
) => {
  const [localNotes, setLocalNotes] = useState<Note[]>(initialNotes);

  useEffect(() => {
    if (!isGlobalSearch || !searchQuery) {
      setLocalNotes(initialNotes);
    }
  }, [initialNotes, isGlobalSearch, searchQuery]);

  return { localNotes, setLocalNotes };
};