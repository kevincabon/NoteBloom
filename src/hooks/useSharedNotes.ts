import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

export const useSharedNotes = () => {
  return useQuery({
    queryKey: ["shared-notes"],
    queryFn: async () => {
      try {
        // Récupérer l'utilisateur courant
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return [];
        }


        // Récupérer d'abord les IDs des notes partagées avec l'utilisateur
        const { data: sharedNoteIds, error: sharesError } = await supabase
          .from("note_shares")
          .select("note_id")
          .eq("user_id", user.id);

        if (sharesError) {
          console.error("Error fetching shared note IDs:", sharesError);
          throw sharesError;
        }

        if (!sharedNoteIds || sharedNoteIds.length === 0) {
          return [];
        }

        const noteIds = sharedNoteIds.map(share => share.note_id);

        // Récupérer les notes complètes
        const { data: notes, error: notesError } = await supabase
          .from("notes")
          .select("*, folders(name, color)")
          .in("id", noteIds);

        if (notesError) {
          console.error("Error fetching shared notes:", notesError);
          throw notesError;
        }

        if (!notes || notes.length < noteIds.length) {
          console.warn("Some shared notes were not found:", {
            requestedIds: noteIds,
            foundNotes: notes?.map(n => n.id) || []
          });
        }

        const notesWithOwners = await Promise.all(
          (notes || []).map(async (note) => {
            const { data: ownerData, error: ownerError } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", note.user_id)
              .single();

            if (ownerError) {
              console.error("Error fetching owner data for note:", note.id, ownerError);
            }

            return {
              ...note,
              folder_name: note.folders?.name,
              folder_color: note.folders?.color,
              owner: ownerData?.username || "Unknown",
            };
          })
        );

        return notesWithOwners;
      } catch (error) {
        console.error("Error in useSharedNotes:", error);
        throw error;
      }
    },
  });
};
