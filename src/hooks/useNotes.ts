import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useNotes = (initialNotes: Note[] = []) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createNote = async (note: Omit<Note, "id" | "created_at" | "updated_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      console.log("Creating note with data:", { ...note, user_id: user.id });

      const { data, error } = await supabase
        .from("notes")
        .insert([{ ...note, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error("Error creating note:", error);
        throw error;
      }

      console.log("Note created successfully:", data);
      setNotes([data, ...notes]);
      
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

      setNotes(notes.map(n => n.id === note.id ? note : n));
      
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
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
      
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
    setNotes,
    createNote,
    updateNote,
    deleteNote,
  };
};