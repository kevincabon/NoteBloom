import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNoteCrud } from "./useNoteCrud";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export const useNotes = (initialNotes: Note[] = []) => {
  const navigate = useNavigate();
  const { createNote, updateNote, deleteNote } = useNoteCrud();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

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
        .select("*, folders(name, color)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const transformedData = data.map((note: any) => ({
        ...note,
        folder_name: note.folders?.name,
        folder_color: note.folders?.color,
      }));
      
      console.log("Notes fetched:", transformedData);
      return transformedData as Note[];
    },
    staleTime: 1000,
    refetchOnWindowFocus: false,
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
          
          // Immédiatement invalider le cache et forcer un refetch
          await queryClient.invalidateQueries({ queryKey: ["notes"] });
          
          // Afficher la notification appropriée
          if (payload.eventType === 'INSERT') {
            toast({
              title: t('notes.created'),
              description: t('notes.noteCreatedSuccess'),
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: t('notes.updated'),
              description: t('notes.noteUpdatedSuccess'),
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: t('notes.deleted'),
              description: t('notes.noteDeletedSuccess'),
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Notes channel status:", status);
      });

    return () => {
      console.log("Cleaning up notes channel");
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, t]);

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
  };
};