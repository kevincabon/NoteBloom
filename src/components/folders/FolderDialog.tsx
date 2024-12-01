import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Folder } from "@/types/folder";
import { useRoleLimits } from "@/hooks/useRoleLimits";
import { LimitUsage } from "@/components/ui/LimitUsage";
import { User } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// Fonction utilitaire pour vérifier si un dossier est un descendant d'un autre
const isDescendantOf = (folder: Folder, ancestorId: string | undefined, folders: Folder[]): boolean => {
  if (!ancestorId || !folder.parent_id) return false;
  if (folder.parent_id === ancestorId) return true;
  const parent = folders.find(f => f.id === folder.parent_id);
  return parent ? isDescendantOf(parent, ancestorId, folders) : false;
};

interface FormData {
  name: string;
  color: string;
  parent_id: string | null;
}

interface FolderDialogProps {
  folder?: Folder;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; color: string; parent_id: string | null }) => void;
  folders: Folder[];
  user: User | null;
}

export const FolderDialog = ({
  folder,
  isOpen,
  onOpenChange,
  onSubmit,
  folders,
  user,
}: FolderDialogProps) => {
  const { t } = useTranslation();
  const { limits } = useRoleLimits();

  const form = useForm<FormData>({
    defaultValues: {
      name: folder?.name ?? "",
      color: folder?.color ?? "#000000",
      parent_id: folder?.parent_id ?? null,
    }
  });

  const selectedParentId = form.watch("parent_id");
  const isSubmitting = form.formState.isSubmitting;

  // Obtenir les limites actuelles
  const currentRootCount = folders.filter(f => 
    !f.parent_id && 
    f.user_id === user?.id && 
    (!folder || f.id !== folder.id)
  ).length;

  // Compter les sous-dossiers du dossier parent sélectionné
  const getSubFolderCount = (parentId: string) => {
    const parent = folders.find(f => f.id === parentId);
    if (!parent) return 0;

    // Compter les enfants directs uniquement
    return folders.filter(f => 
      f.parent_id === parentId && 
      f.user_id === user?.id && 
      (!folder || f.id !== folder.id)
    ).length;
  };

  const currentSubFolderCount = selectedParentId && selectedParentId !== "none"
    ? getSubFolderCount(selectedParentId)
    : 0;

  const maxRootFolders = limits?.max_root_folders ?? 6;
  const maxSubFolders = limits?.max_subfolders ?? 3;

  // Vérifier si on peut créer un dossier au niveau sélectionné
  const isCreatingRootFolder = !selectedParentId || selectedParentId === "none";
  const isCreatingSubFolder = selectedParentId && selectedParentId !== "none";

  // Afficher les limites appropriées
  const showRootFolderLimit = isCreatingRootFolder || (!folder && !selectedParentId);
  const showSubFolderLimit = isCreatingSubFolder || (folder && folder.parent_id);

  const canCreateInCurrentContext = isCreatingSubFolder
    ? currentSubFolderCount < maxSubFolders
    : currentRootCount < maxRootFolders;

  const handleSubmit = async (data: FormData) => {
    if (!canCreateInCurrentContext) return;

    try {
      await onSubmit({
        name: data.name,
        color: data.color,
        parent_id: data.parent_id === "none" ? null : data.parent_id
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting folder:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {folder ? t('folders.editFolder') : t('folders.createFolder')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('folders.name')}</Label>
            <Input
              id="name"
              {...form.register("name", { required: true })}
              placeholder={t('folders.namePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_id">{t('folders.parent')}</Label>
            <Select
              value={form.watch("parent_id") || "none"}
              onValueChange={(value) => {
                form.setValue("parent_id", value === "none" ? null : value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('folders.noParent')}</SelectItem>
                {folders
                  .filter(f => f.id !== folder?.id && !isDescendantOf(f, folder?.id, folders))
                  .map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">{t('folders.color')}</Label>
            <Input
              id="color"
              type="color"
              {...form.register("color")}
              className="h-10 px-1 py-1"
            />
          </div>

          {/* Afficher les limites */}
          {showRootFolderLimit && (
            <LimitUsage
              current={currentRootCount}
              max={maxRootFolders}
              type="rootFolders"
              className="mt-4"
            />
          )}
          {showSubFolderLimit && (
            <LimitUsage
              current={currentSubFolderCount}
              max={maxSubFolders}
              type="subFolders"
              className="mt-4"
            />
          )}

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting || !canCreateInCurrentContext}
              className={cn(
                "relative",
                !canCreateInCurrentContext && "cursor-not-allowed opacity-50"
              )}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {folder ? t('common.save') : t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};