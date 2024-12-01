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

  const { data: notes = initialNotes } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
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
      return data as Note[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
  };
};