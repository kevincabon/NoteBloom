import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/components/auth/supabase-provider";
import { Tag } from "@/types/tag";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export const useNoteTags = (noteId: string) => {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Clé unique pour cette note
  const noteTagsKey = ["note-tags", noteId];

  const { data: noteTags, isLoading } = useQuery<Tag[]>({
    queryKey: noteTagsKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('note_tags')
        .select(`
          tag_id,
          tags:tag_id (
            id,
            name,
            color
          )
        `)
        .eq('note_id', noteId);

      if (error) throw error;
      
      // Transformer les données pour n'avoir que les tags
      return data.map(item => item.tags);
    },
    staleTime: 0, // Toujours revalider les données
  });

  const addTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("note_tags")
        .insert([{ note_id: noteId, tag_id: tagId }]);

      if (error) throw error;
    },
    onMutate: async (tagId) => {
      await queryClient.cancelQueries({ queryKey: noteTagsKey });
      const previousTags = queryClient.getQueryData<Tag[]>(noteTagsKey) || [];

      // Trouver le tag dans la liste complète des tags
      const allTags = queryClient.getQueryData<Tag[]>(["tags"]) || [];
      const newTag = allTags.find(tag => tag.id === tagId);

      if (newTag) {
        queryClient.setQueryData<Tag[]>(
          noteTagsKey,
          [...previousTags, newTag]
        );
      }

      return { previousTags };
    },
    onError: (error, _, context) => {
      if (context?.previousTags) {
        queryClient.setQueryData(noteTagsKey, context.previousTags);
      }
      console.error("Error adding tag:", error);
      toast({
        title: t("tags.addError"),
        description: t("tags.addErrorDescription"),
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteTagsKey });
      toast({
        title: t("tags.addSuccess"),
        description: t("tags.addSuccessDescription"),
      });
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("note_tags")
        .delete()
        .match({ note_id: noteId, tag_id: tagId });

      if (error) throw error;
    },
    onMutate: async (tagId) => {
      await queryClient.cancelQueries({ queryKey: noteTagsKey });
      const previousTags = queryClient.getQueryData<Tag[]>(noteTagsKey) || [];

      queryClient.setQueryData<Tag[]>(
        noteTagsKey,
        previousTags.filter(tag => tag.id !== tagId)
      );

      return { previousTags };
    },
    onError: (error, _, context) => {
      if (context?.previousTags) {
        queryClient.setQueryData(noteTagsKey, context.previousTags);
      }
      console.error("Error removing tag:", error);
      toast({
        title: t("tags.removeError"),
        description: t("tags.removeErrorDescription"),
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteTagsKey });
      toast({
        title: t("tags.removeSuccess"),
        description: t("tags.removeSuccessDescription"),
      });
    },
  });

  return {
    tags: noteTags || [],
    isLoading,
    addTag: addTag.mutate,
    removeTag: removeTag.mutate,
  };
};
