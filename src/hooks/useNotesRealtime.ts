import { useEffect } from "react";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

export const useNotesRealtime = (setNotes: React.Dispatch<React.SetStateAction<Note[]>>, initialNotes: Note[]) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Setting up realtime subscription for notes");
    
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
          console.log("Received realtime update:", payload);
          
          if (payload.eventType === 'INSERT') {
            const newNote = payload.new as Note;
            if (newNote.folder_id) {
              const { data: folder } = await supabase
                .from('folders')
                .select('name, color')
                .eq('id', newNote.folder_id)
                .single();
              if (folder) {
                newNote.folder_name = folder.name;
                newNote.folder_color = folder.color;
              }
            }
            setNotes(prev => {
              // Vérifier si la note existe déjà
              if (prev.some(note => note.id === newNote.id)) {
                return prev;
              }
              return [newNote, ...prev];
            });
            toast({
              title: t('notes.created'),
              description: t('notes.noteCreatedSuccess'),
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedNote = payload.new as Note;
            if (updatedNote.folder_id) {
              const { data: folder } = await supabase
                .from('folders')
                .select('name, color')
                .eq('id', updatedNote.folder_id)
                .single();
              if (folder) {
                updatedNote.folder_name = folder.name;
                updatedNote.folder_color = folder.color;
              }
            }
            setNotes(prev => prev.map(note => 
              note.id === updatedNote.id ? updatedNote : note
            ));
            toast({
              title: t('notes.updated'),
              description: t('notes.noteUpdatedSuccess'),
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedNote = payload.old as Note;
            setNotes(prev => prev.filter(note => note.id !== deletedNote.id));
            toast({
              title: t('notes.deleted'),
              description: t('notes.noteDeletedSuccess'),
            });
          }
          
          // Invalider le cache de react-query
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient, t, toast, setNotes]);
};