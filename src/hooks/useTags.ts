import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/components/auth/supabase-provider";
import { Tag } from "@/types/tag";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export const useTags = () => {
  const { supabase } = useSupabase();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags, isLoading } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const createTag = useMutation({
    mutationFn: async (newTag: Pick<Tag, "name" | "color">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tags")
        .insert([{ ...newTag, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all tag-related queries
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      // Invalidate all note-tag queries
      queryClient.invalidateQueries({ queryKey: ["notes", "tags"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("tags.errors.createError"),
      });
    },
  });

  const updateTag = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Tag> & { id: string }) => {
      const { data, error } = await supabase
        .from("tags")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all tag-related queries
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      // Invalidate all note-tag queries
      queryClient.invalidateQueries({ queryKey: ["notes", "tags"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("tags.errors.updateError"),
      });
    },
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all tag-related queries
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      // Invalidate all note-tag queries
      queryClient.invalidateQueries({ queryKey: ["notes", "tags"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("tags.errors.deleteError"),
      });
    },
  });

  return {
    tags: tags || [],
    isLoading,
    createTag: createTag.mutate,
    updateTag: updateTag.mutate,
    deleteTag: deleteTag.mutate,
  };
};
