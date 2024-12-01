import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNoteCrud } from "./useNoteCrud";
import { useEffect } from "react";

export const useNotes = (initialNotes: Note[] = []) => {
  const navigate = useNavigate();
  const { createNote, updateNote, deleteNote } = useNoteCrud();
  const queryClient = useQueryClient();

  const { data: notes = initialNotes, refetch } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      console.log("Fetching notes...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return initialNotes;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Notes fetched:", data);
      return data as Note[];
    },
  });

  useEffect(() => {
    console.log("Setting up notes channel subscription");
    const channel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        async (payload) => {
          console.log("Notes change detected:", payload);
          await refetch();
        }
      )
      .subscribe((status) => {
        console.log("Notes channel status:", status);
      });

    return () => {
      console.log("Cleaning up notes channel");
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
  };
};