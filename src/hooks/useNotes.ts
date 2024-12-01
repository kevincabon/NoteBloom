import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNoteCrud } from "./useNoteCrud";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface RealtimeNote extends Note {
  folders?: {
    name: string;
    color: string;
  };
}

type DatabaseChangesPayload = RealtimePostgresChangesPayload<{
  [key: string]: any;
}>;

export const useNotes = (initialNotes: Note[] = []) => {
  const navigate = useNavigate();
  const { createNote, updateNote, deleteNote } = useNoteCrud();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fonction pour récupérer toutes les notes
  const fetchNotes = async (userId: string) => {
    console.log("Fetching notes for user:", userId);
    const { data, error } = await supabase
      .from("notes")
      .select("*, folders(name, color)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    const transformedData = data.map((note: RealtimeNote) => ({
      ...note,
      folder_name: note.folders?.name,
      folder_color: note.folders?.color,
    }));
    
    console.log("Notes fetched:", transformedData);
    return transformedData as Note[];
  };

  const { data: notes = initialNotes } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      console.log("Initial notes fetch...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return initialNotes;
      }
      return fetchNotes(user.id);
    },
  });

  useEffect(() => {
    const channel = supabase.channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        async (payload: DatabaseChangesPayload) => {
          console.log("Realtime change received:", payload);
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          try {
            // Pour chaque événement, on refetch les données
            const freshNotes = await fetchNotes(user.id);
            queryClient.setQueryData(["notes"], freshNotes);
          } catch (error) {
            console.error("Error handling realtime update:", error);
            queryClient.invalidateQueries({ queryKey: ["notes"] });
          }
        }
      )
      .subscribe((status) => {
        console.log("Channel subscription status:", status);
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient, t]);

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
  };
};