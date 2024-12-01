import { useState } from "react";
import { Folder, Plus, MoreVertical, FolderEdit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface FolderType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export const FolderList = ({ onSelectFolder }: { onSelectFolder: (folderId: string | null) => void }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
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
      const { error } = await supabase.from("folders").insert({
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Dossier créé avec succès",
      });

      setNewFolderName("");
      setNewFolderDescription("");
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
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Dossiers</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau dossier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau dossier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Mon dossier"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea
                  id="description"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="Description du dossier..."
                />
              </div>
              <Button onClick={handleCreateFolder} className="w-full">
                Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
          <div key={folder.id} className="flex items-center group">
            <Button
              variant="ghost"
              className="flex-1 justify-start"
              onClick={() => onSelectFolder(folder.id)}
            >
              <Folder className="h-4 w-4 mr-2" />
              {folder.name}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(folder)}>
                  <FolderEdit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteFolder(folder.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le dossier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optionnelle)</Label>
              <Textarea
                id="edit-description"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateFolder} className="w-full">
              Mettre à jour
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};