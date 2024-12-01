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

  const { data: notes = initialNotes } = useQuery({
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
  });

  useEffect(() => {
    console.log("Setting up realtime subscription");
    const channel = supabase.channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        async (payload) => {
          console.log("Realtime change received:", payload);
          
          // Récupérer les notes actuelles du cache
          const currentNotes = queryClient.getQueryData<Note[]>(["notes"]) || [];
          
          let newNotes: Note[];
          let toastMessage;

          switch (payload.eventType) {
            case 'INSERT':
              // Pour un INSERT, ajouter la nouvelle note au début du tableau
              newNotes = [payload.new as Note, ...currentNotes];
              toastMessage = { title: t('notes.created'), description: t('notes.noteCreatedSuccess') };
              break;

            case 'UPDATE':
              // Pour un UPDATE, remplacer la note existante
              newNotes = currentNotes.map(note => 
                note.id === payload.new.id ? payload.new as Note : note
              );
              toastMessage = { title: t('notes.updated'), description: t('notes.noteUpdatedSuccess') };
              break;

            case 'DELETE':
              // Pour un DELETE, retirer la note du tableau
              newNotes = currentNotes.filter(note => note.id !== payload.old.id);
              toastMessage = { title: t('notes.deleted'), description: t('notes.noteDeletedSuccess') };
              break;

            default:
              return;
          }

          // Mettre à jour le cache avec les nouvelles données
          queryClient.setQueryData(["notes"], newNotes);
          
          if (toastMessage) {
            toast(toastMessage);
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
  }, [queryClient, toast, t]);

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
  };
};