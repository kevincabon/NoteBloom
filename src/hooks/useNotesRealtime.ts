import { useEffect } from "react";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

export const useNotesRealtime = (onNoteChange: (notes: Note[]) => void, initialNotes: Note[]) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

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
          if (payload.eventType === 'INSERT') {
            const newNote = payload.new as Note;
            onNoteChange(prev => {
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
            onNoteChange(prev => prev.map(note => 
              note.id === updatedNote.id ? updatedNote : note
            ));
            toast({
              title: t('notes.updated'),
              description: t('notes.noteUpdatedSuccess'),
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedNote = payload.old as Note;
            onNoteChange(prev => prev.filter(note => note.id !== deletedNote.id));
            toast({
              title: t('notes.deleted'),
              description: t('notes.noteDeletedSuccess'),
            });
          }
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, t, toast, onNoteChange]);
};