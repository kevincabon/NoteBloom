import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { Note } from "@/types/note";

export type CreateNoteParams = {
  title: string;
  content: string | null;
  images: string[];
  audioUrl: string | null;
  folderId: string | null;
};

export const useNoteMutations = (
  handleCreateNote: (title: string, content: string | null, images: string[], audioUrl: string | null, folderId: string | null) => Promise<void>,
  handleUpdateNote: (note: Note) => Promise<void>,
  handleDeleteNote: (id: string) => Promise<void>
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const createNoteMutation = useMutation({
    mutationFn: async (params: CreateNoteParams) => {
      const { title, content, images, audioUrl, folderId } = params;
      await handleCreateNote(title, content, images, audioUrl, folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: t("notes.created"),
        description: t("notes.noteCreatedSuccess"),
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: handleUpdateNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: t("notes.updated"),
        description: t("notes.noteUpdatedSuccess"),
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: handleDeleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: t("notes.deleted"),
        description: t("notes.noteDeletedSuccess"),
      });
    },
  });

  return {
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
  };
};