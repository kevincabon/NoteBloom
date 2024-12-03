import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Note } from '@/types/note';
import { useEffect } from 'react';

export function useNote(noteId: string) {
  const queryClient = useQueryClient();

  const { data: note, isLoading, error } = useQuery<Note>({
    queryKey: ['note', noteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*, folders(*)')
        .eq('id', noteId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    // Souscrire aux changements de la note spécifique
    const channel = supabase
      .channel(`note-${noteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${noteId}`,
        },
        () => {
          // Invalider et recharger la note
          queryClient.invalidateQueries({ queryKey: ['note', noteId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [noteId, queryClient]);

  const invalidateNote = () => {
    queryClient.invalidateQueries({ queryKey: ['note', noteId] });
  };

  return {
    note,
    isLoading,
    error,
    invalidateNote,
  };
}
