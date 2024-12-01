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

      const { data, error } = await supabase
        .from("notes")
        .insert([{ ...note, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

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
      const { error } = await supabase
        .from("notes")
        .update(note)
        .eq('id', note.id);

      if (error) throw error;
      
      toast({
        title: "Note mise à jour",
      });
    } catch (error) {
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