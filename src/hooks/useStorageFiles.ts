import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

export const useStorageFiles = () => {
  const deleteStorageFiles = async (note: Note) => {
    try {
      // Supprimer les images
      if (note.images && note.images.length > 0) {
        const imagePaths = note.images.map(url => {
          const segments = url.split('/');
          return segments[segments.length - 1];
        });
        
        if (imagePaths.length > 0) {
          const { error: imageError } = await supabase.storage
            .from('notes-images')
            .remove(imagePaths);

          if (imageError) {
            console.error("Error deleting images:", imageError);
          }
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
    } catch (error) {
      console.error("Error in deleteStorageFiles:", error);
    }
  };

  return { deleteStorageFiles };
};