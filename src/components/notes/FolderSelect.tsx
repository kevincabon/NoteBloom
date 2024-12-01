import { Folder } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FolderSelectProps {
  selectedFolderId: string | null;
  onFolderChange: (folderId: string | null) => void;
}

export const FolderSelect = ({ selectedFolderId, onFolderChange }: FolderSelectProps) => {
  const { t } = useTranslation();

  const { data: folders = [] } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex items-center space-x-2">
      <Folder className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedFolderId || "no-folder"}
        onValueChange={(value) => onFolderChange(value === "no-folder" ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t('notes.selectFolder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-folder">
            {t('notes.noFolder')}
          </SelectItem>
          {folders.map((folder) => (
            <SelectItem key={folder.id} value={folder.id}>
              {folder.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};