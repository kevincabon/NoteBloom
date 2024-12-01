import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Folder } from "lucide-react";

interface CurrentFolderHeaderProps {
  selectedFolderId: string | null;
}

export const CurrentFolderHeader = ({ selectedFolderId }: CurrentFolderHeaderProps) => {
  const { data: folder } = useQuery({
    queryKey: ["folders", selectedFolderId],
    queryFn: async () => {
      if (!selectedFolderId) return null;
      
      const { data } = await supabase
        .from("folders")
        .select("*")
        .eq("id", selectedFolderId)
        .single();
      
      return data;
    },
    enabled: !!selectedFolderId,
  });

  if (!selectedFolderId) {
    return (
      <div className="flex items-center gap-2 mb-8 text-lg font-medium">
        <Folder className="h-5 w-5" />
        <span>Toutes les notes</span>
      </div>
    );
  }

  if (!folder) return null;

  return (
    <div className="flex items-center gap-2 mb-8 text-lg font-medium" style={{ color: folder.color }}>
      <Folder className="h-5 w-5" />
      <span>{folder.name}</span>
    </div>
  );
};