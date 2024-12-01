import { useState } from "react";
import { Plus, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderItem } from "./FolderItem";
import { FolderDialog } from "./FolderDialog";

interface FolderType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  color: string;
}

export const FolderList = ({ onSelectFolder }: { onSelectFolder: (folderId: string | null) => void }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#e5e5e5");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      return data as FolderType[];
    },
  });

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Le nom du dossier est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("folders").insert({
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || null,
        color: newFolderColor,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Dossier créé avec succès",
      });

      setNewFolderName("");
      setNewFolderDescription("");
      setNewFolderColor("#e5e5e5");
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    } catch (error) {
      toast({
        title: "Erreur lors de la création du dossier",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFolder = async () => {
    if (!selectedFolder || !newFolderName.trim()) return;

    try {
      const { error } = await supabase
        .from("folders")
        .update({
          name: newFolderName.trim(),
          description: newFolderDescription.trim() || null,
          color: newFolderColor,
        })
        .eq("id", selectedFolder.id);

      if (error) throw error;

      toast({
        title: "Dossier mis à jour avec succès",
      });

      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    } catch (error) {
      toast({
        title: "Erreur lors de la mise à jour du dossier",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase.from("folders").delete().eq("id", folderId);

      if (error) throw error;

      toast({
        title: "Dossier supprimé avec succès",
      });

      onSelectFolder(null);
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    } catch (error) {
      toast({
        title: "Erreur lors de la suppression du dossier",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (folder: FolderType) => {
    setSelectedFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderDescription(folder.description || "");
    setNewFolderColor(folder.color);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Dossiers</h2>
        <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau dossier
        </Button>
      </div>

      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => onSelectFolder(null)}
        >
          <Folder className="h-4 w-4 mr-2" />
          Toutes les notes
        </Button>
        
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            onSelect={() => onSelectFolder(folder.id)}
            onEdit={openEditDialog}
            onDelete={handleDeleteFolder}
          />
        ))}
      </div>

      <FolderDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Créer un nouveau dossier"
        folderName={newFolderName}
        folderDescription={newFolderDescription}
        folderColor={newFolderColor}
        onNameChange={setNewFolderName}
        onDescriptionChange={setNewFolderDescription}
        onColorChange={setNewFolderColor}
        onSubmit={handleCreateFolder}
        submitLabel="Créer"
      />

      <FolderDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifier le dossier"
        folderName={newFolderName}
        folderDescription={newFolderDescription}
        folderColor={newFolderColor}
        onNameChange={setNewFolderName}
        onDescriptionChange={setNewFolderDescription}
        onColorChange={setNewFolderColor}
        onSubmit={handleUpdateFolder}
        submitLabel="Mettre à jour"
      />
    </div>
  );
};