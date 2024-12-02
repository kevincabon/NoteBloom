import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';

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
