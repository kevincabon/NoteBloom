import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { Note } from "@/types";

interface CreateNoteParams {
  title: string;
  content: string | null;
  images: string[];
  audioUrl: string | null;
  folderId: string | null;
}

export const useNoteMutations = (
  handleCreateNote: (title: string, content: string | null, images: string[], audioUrl: string | null, folderId: string | null) => Promise<void>,
  handleUpdateNote: (note: Note) => Promise<Note>,
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
      queryClient.refetchQueries({ queryKey: ["notes"] });
      toast({
        title: t("notes.created"),
        description: t("notes.noteCreatedSuccess"),
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: handleUpdateNote,
    onSuccess: (updatedNote: Note) => {
      // Invalider et recharger la liste des notes
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.refetchQueries({ queryKey: ["notes"] });

      // Invalider et recharger la note individuelle
      queryClient.invalidateQueries({ queryKey: ["note", updatedNote.id] });
      queryClient.refetchQueries({ queryKey: ["note", updatedNote.id] });

      // Mettre à jour le cache immédiatement
      queryClient.setQueryData(["note", updatedNote.id], updatedNote);

      toast({
        title: t("notes.updated"),
        description: t("notes.updatedSuccess"),
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: handleDeleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.refetchQueries({ queryKey: ["notes"] });
      toast({
        title: t("notes.deleted"),
        description: t("notes.deletedSuccess"),
      });
    },
  });

  return {
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
  };
};