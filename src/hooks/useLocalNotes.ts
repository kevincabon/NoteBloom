import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { useNotesRealtime } from "./useNotesRealtime";

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

  useNotesRealtime(setLocalNotes, initialNotes);

  return { localNotes, setLocalNotes };
};