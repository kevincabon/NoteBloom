import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useGuestMode } from "@/contexts/GuestModeContext";

export const useGlobalSearch = (searchQuery: string, isGlobalSearch: boolean) => {
  const [globalSearchResults, setGlobalSearchResults] = useState<Note[]>([]);
  const { isGuestMode } = useGuestMode();

  useEffect(() => {
    const fetchAllNotes = async () => {
      if (!isGuestMode && isGlobalSearch) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let query = supabase
          .from("notes")
          .select("*")
          .eq("user_id", user.id);

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%, content.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching notes:", error);
          return;
        }

        if (data) {
          setGlobalSearchResults(data);
        }
      } else {
        setGlobalSearchResults([]);
      }
    };

    fetchAllNotes();
  }, [isGlobalSearch, searchQuery, isGuestMode]);

  return globalSearchResults;
};