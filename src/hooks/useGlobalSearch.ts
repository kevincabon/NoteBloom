import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useGuestMode } from "@/contexts/GuestModeContext";

export const useGlobalSearch = (searchQuery: string, isGlobalSearch: boolean) => {
  const [globalSearchResults, setGlobalSearchResults] = useState<Note[]>([]);
  const { isGuestMode } = useGuestMode();

  useEffect(() => {
    const fetchAllNotes = async () => {
      if (isGlobalSearch && !isGuestMode) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let query = supabase
          .from("notes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (searchQuery) {
          query = query.ilike("title", `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching notes:", error);
          return;
        }

        if (data) {
          setGlobalSearchResults(data);
        }
      }
    };

    fetchAllNotes();
  }, [isGlobalSearch, searchQuery, isGuestMode]);

  return globalSearchResults;
};