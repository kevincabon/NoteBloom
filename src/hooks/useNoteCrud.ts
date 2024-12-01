import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useStorageFiles } from "./useStorageFiles";

export const useNoteCrud = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { deleteStorageFiles } = useStorageFiles();

  const createNote = async (note: Omit<Note, "id" | "created_at" | "updated_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const noteData = {
        ...note,
        content: note.content || null,
        user_id: user.id
      };


      const { data, error } = await supabase
        .from("notes")
        .insert([noteData])
        .select()
        .single();

      if (error) {
        console.error("Error creating note:", error);
        throw error;
      }

      toast({
        title: "Note créée avec succès",
      });

      return data;
    } catch (error) {
      console.error("Error in createNote:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la note",
        variant: "destructive",
      });
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

      const { error } = await supabase
        .from("notes")
        .update(updateData)
        .eq('id', note.id);

      if (error) {
        console.error("Error updating note:", error);
        throw error;
      }
      
      toast({
        title: "Note mise à jour",
      });
    } catch (error) {
      console.error("Error in updateNote:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la note",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      // Vérifier d'abord si la note existe
      const { data: noteToDelete, error: fetchError } = await supabase
        .from("notes")
        .select("*")
        .eq('id', noteId)
        .maybeSingle();  // Utiliser maybeSingle au lieu de single

      if (fetchError) {
        console.error("Error fetching note:", fetchError);
        throw fetchError;
      }

      // Si la note n'existe pas, on considère que la suppression est réussie
      if (!noteToDelete) {
        return;
      }

      // Supprimer les fichiers associés
      await deleteStorageFiles(noteToDelete);

      // Supprimer la note
      const { error: deleteError } = await supabase
        .from("notes")
        .delete()
        .eq('id', noteId);

      if (deleteError) throw deleteError;
      
      toast({
        title: "Note supprimée",
      });
    } catch (error) {
      console.error("Error in deleteNote:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      });
    }
  };

  return {
    createNote,
    updateNote,
    deleteNote,
  };
};