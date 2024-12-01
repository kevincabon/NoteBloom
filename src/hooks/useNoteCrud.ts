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

      // S'assurer que content n'est jamais une chaîne vide
      const noteData = {
        ...note,
        content: note.content || null,
        user_id: user.id
      };

      console.log("Creating note with data:", noteData);

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
      // S'assurer que content n'est jamais une chaîne vide
      const noteData = {
        ...note,
        content: note.content || null
      };

      console.log("Updating note with data:", noteData);

      const { error } = await supabase
        .from("notes")
        .update(noteData)
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
      const { data: noteToDelete, error: fetchError } = await supabase
        .from("notes")
        .select("*")
        .eq('id', noteId)
        .single();

      if (fetchError) throw fetchError;

      if (noteToDelete) {
        await deleteStorageFiles(noteToDelete);
      }

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      
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