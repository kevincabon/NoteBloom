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
      
      const transformedData = data.map((note: RealtimeNote) => ({
        ...note,
        folder_name: note.folders?.name,
        folder_color: note.folders?.color,
      }));
      
      console.log("Notes fetched:", transformedData);
      return transformedData as Note[];
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

          // Function to fetch folder details if needed
          const getFolderDetails = async (folderId: string | null) => {
            if (!folderId) return null;
            const { data } = await supabase
              .from('folders')
              .select('name, color')
              .eq('id', folderId)
              .single();
            return data;
          };

          try {
            switch (payload.eventType) {
              case 'INSERT': {
                if (payload.new && 'user_id' in payload.new && payload.new.user_id === user.id) {
                  const folder = await getFolderDetails(payload.new.folder_id);
                  
                  queryClient.setQueryData<Note[]>(["notes"], (oldNotes = []) => {
                    const newNote = {
                      ...payload.new,
                      folder_name: folder?.name,
                      folder_color: folder?.color,
                    } as Note;
                    return [newNote, ...oldNotes];
                  });
                }
                break;
              }
              case 'UPDATE': {
                if (payload.new && 'user_id' in payload.new && payload.new.user_id === user.id) {
                  const folder = await getFolderDetails(payload.new.folder_id);
                  
                  queryClient.setQueryData<Note[]>(["notes"], (oldNotes = []) => {
                    return oldNotes.map(note => 
                      note.id === payload.new.id 
                        ? {
                            ...payload.new,
                            folder_name: folder?.name,
                            folder_color: folder?.color,
                          } as Note
                        : note
                    );
                  });
                }
                break;
              }
              case 'DELETE': {
                if (payload.old && 'id' in payload.old) {
                  queryClient.setQueryData<Note[]>(["notes"], (oldNotes = []) => {
                    return oldNotes.filter(note => note.id !== payload.old.id);
                  });
                }
                break;
              }
            }
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