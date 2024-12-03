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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fonction pour récupérer toutes les notes
  const fetchNotes = async (userId: string, folderId?: string | null) => {
    
    // Si un dossier est sélectionné, récupérer d'abord tous les sous-dossiers
    let folderIds: string[] = [];
    if (folderId) {
      const { data: folders } = await supabase
        .from("folders")
        .select("id, parent_id");

      const getSubFolderIds = (parentId: string): string[] => {
        const subFolders = folders?.filter(f => f.parent_id === parentId) || [];
        return [
          parentId,
          ...subFolders.flatMap(f => getSubFolderIds(f.id))
        ];
      };

      folderIds = getSubFolderIds(folderId);
    }

    // Construire la requête
    let query = supabase
      .from("notes")
      .select("*, folders(name, color)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Si un dossier est sélectionné, filtrer par tous les dossiers (parent + enfants)
    if (folderId !== undefined && folderIds.length > 0) {
      query = query.in("folder_id", folderIds);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    const transformedData = data.map((note: RealtimeNote) => ({
      ...note,
      folder_name: note.folders?.name,
      folder_color: note.folders?.color,
    }));
    return transformedData as Note[];
  };

  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return [];
      }
      return fetchNotes(user.id);
    },
    initialData: initialNotes,
  });

  const createNote = async (note: Note) => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .insert([note])
        .select('*, folders(*)')
        .single();

      if (error) {
        console.error("Error creating note:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in createNote:", error);
      throw error;
    }
  };

  const updateNote = async (note: Note) => {
    try {
      // Exclure les champs qui ne sont pas dans la table notes
      const { tags, folders, ...noteData } = note;
      const updateData = {
        ...noteData,
        content: noteData.content || null,
        folder_id: noteData.folder_id || null
      };

      const { data, error } = await supabase
        .from("notes")
        .update(updateData)
        .eq('id', note.id)
        .select('*, folders(*)')
        .single();

      if (error) {
        console.error("Error updating note:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateNote:", error);
      throw error;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error("Error deleting note:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in deleteNote:", error);
      throw error;
    }
  };

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
      });

    return () => {
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