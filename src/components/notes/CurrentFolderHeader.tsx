import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FolderIcon, UsersIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CurrentFolderHeaderProps {
  selectedFolderId: string | null;
}

export const CurrentFolderHeader = ({ selectedFolderId }: CurrentFolderHeaderProps) => {
  const { t } = useTranslation();

  const { data: folder } = useQuery({
    queryKey: ["folders", selectedFolderId],
    queryFn: async () => {
      if (!selectedFolderId || selectedFolderId === "shared") return null;

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("id", selectedFolderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedFolderId && selectedFolderId !== "shared",
  });

  // Si c'est le dossier partagé
  if (selectedFolderId === "shared") {
    return (
      <div className="flex items-center space-x-2">
        <UsersIcon className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          {t("notes.shared.title")}
        </h2>
      </div>
    );
  }

  // Si c'est "Toutes les notes"
  if (!selectedFolderId) {
    return (
      <div className="flex items-center space-x-2">
        <FolderIcon className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          {t("folders.all")}
        </h2>
      </div>
    );
  }

  // Si c'est un dossier spécifique
  return (
    <div className="flex items-center space-x-2">
      <FolderIcon 
        className="w-5 h-5" 
        style={{ color: folder?.color || 'var(--muted-foreground)' }}
      />
      <h2 className="text-lg font-semibold">
        {folder?.name || t("folders.loading")}
      </h2>
    </div>
  );
};