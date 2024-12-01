import { useToast } from "@/components/ui/use-toast";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export const useNotes = (initialNotes: Note[] = []) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: notes = initialNotes } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return initialNotes;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
  });

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

  const deleteStorageFiles = async (note: Note) => {
    // Supprimer les images
    if (note.images && note.images.length > 0) {
      const imagePaths = note.images.map(url => url.split('/').pop());
      const { error: imageError } = await supabase.storage
        .from('notes-images')
        .remove(imagePaths as string[]);

      if (imageError) {
        console.error("Error deleting images:", imageError);
      }
    }

    // Supprimer l'audio
    if (note.audio_url) {
      const audioPath = note.audio_url.split('/').pop();
      if (audioPath) {
        const { error: audioError } = await supabase.storage
          .from('notes-audio')
          .remove([audioPath]);

        if (audioError) {
          console.error("Error deleting audio:", audioError);
        }
      }
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      // Récupérer la note avant de la supprimer
      const { data: noteToDelete, error: fetchError } = await supabase
        .from("notes")
        .select("*")
        .eq('id', noteId)
        .single();

      if (fetchError) throw fetchError;

      // Supprimer les fichiers associés
      if (noteToDelete) {
        await deleteStorageFiles(noteToDelete);
      }

      // Supprimer la note
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
    notes,
    createNote,
    updateNote,
    deleteNote,
  };
};