import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Folder } from "@/types/folder";

interface FolderDialogProps {
  folder?: Folder | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; color?: string; parent_id?: string | null }) => void;
  folders: Folder[];
}

export const FolderDialog = ({
  folder,
  isOpen,
  onOpenChange,
  onSubmit,
  folders,
}: FolderDialogProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [parentId, setParentId] = useState<string | null>(null);

  // Mettre à jour les valeurs quand le dossier change ou quand le dialogue s'ouvre
  useEffect(() => {
    console.log("FolderDialog - isOpen changed:", isOpen);
    if (isOpen) {
      setName(folder?.name || "");
      setColor(folder?.color || "#000000");
      setParentId(folder?.parent_id || null);
    }
  }, [folder, isOpen]);

  // Fonction récursive pour vérifier si un dossier est un descendant
  const isDescendant = (folder: Folder, ancestorId?: string): boolean => {
    if (!ancestorId) return false;
    if (folder.parent_id === ancestorId) return true;
    const parent = folders.find(f => f.id === folder.parent_id);
    return parent ? isDescendant(parent, ancestorId) : false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log("FolderDialog - handleSubmit called");
    e.preventDefault();
    onSubmit({ 
      name, 
      color, 
      parent_id: parentId === "none" ? null : parentId 
    });
  };

  const availableParentFolders = folders.filter(f => 
    // Ne pas permettre de sélectionner le dossier lui-même comme parent
    f.id !== folder?.id &&
    // Ne pas permettre de sélectionner un descendant comme parent
    !isDescendant(f, folder?.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {folder ? t("folders.edit") : t("folders.create")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("folders.name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("folders.namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">{t("folders.color")}</Label>
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">{t("folders.parent")}</Label>
              <Select
                value={parentId || "none"}
                onValueChange={(value) => setParentId(value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("folders.noParent")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("folders.noParent")}</SelectItem>
                  {availableParentFolders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {folder ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};