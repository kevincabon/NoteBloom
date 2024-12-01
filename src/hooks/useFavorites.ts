import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/components/auth/supabase-provider";
import { Note } from "@/types/note";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export const useFavorites = () => {
  const { supabase } = useSupabase();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<Note[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("notes:notes(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(f => f.notes);
    },
  });

  const addToFavorites = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("favorites")
        .insert([{ note_id: noteId }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({
        title: t("favorites.addSuccess"),
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("favorites.addError"),
      });
    },
  });

  const removeFromFavorites = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("note_id", noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({
        title: t("favorites.removeSuccess"),
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("favorites.removeError"),
      });
    },
  });

  const isNoteFavorited = async (noteId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .rpc("is_note_favorited", { note_id: noteId });

    if (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }

    return data;
  };

  return {
    favorites,
    isLoading,
    addToFavorites: addToFavorites.mutate,
    removeFromFavorites: removeFromFavorites.mutate,
    isNoteFavorited,
  };
};
