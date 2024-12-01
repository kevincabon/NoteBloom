import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/ui/color-picker";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Folder } from "@/types/folder";
import { useForm } from "react-hook-form";

const MAX_SUBFOLDERS = 3;

interface FolderDialogProps {
  folder?: Folder;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; color: string; parent_id: string | null }) => void;
  folders: Folder[];
}

interface FormData {
  name: string;
  color: string;
  parent_id: string | null;
}

export const FolderDialog = ({
  folder,
  isOpen: open,
  onOpenChange,
  onSubmit,
  folders,
}: FolderDialogProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: folder?.name || "",
      color: folder?.color || "#000000",
      parent_id: folder?.parent_id || null,
    },
  });

  // Mettre à jour les valeurs quand le dossier change
  useEffect(() => {
    if (folder) {
      form.reset({
        name: folder.name,
        color: folder.color,
        parent_id: folder.parent_id,
      });
    } else {
      form.reset({
        name: "",
        color: "#000000",
        parent_id: null,
      });
    }
  }, [folder, form]);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isParentFolderAtLimit = (parentId: string) => {
    return folders.filter(f => f.parent_id === parentId).length >= MAX_SUBFOLDERS;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {folder ? t('folders.edit') : t('folders.create')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('folders.name')}</Label>
              <Input
                {...form.register('name', { required: true })}
                id="name"
                placeholder={t('folders.namePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">{t('folders.color')}</Label>
              <Input
                {...form.register('color')}
                id="color"
                type="color"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_id">{t('folders.parent')}</Label>
              <Select
                value={form.watch('parent_id') ?? "none"}
                onValueChange={(value) => form.setValue('parent_id', value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('folders.noParent')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('folders.noParent')}
                  </SelectItem>
                  {folders
                    .filter((f) => f.id !== folder?.id) // Exclure le dossier actuel
                    .map((f) => (
                      <SelectItem
                        key={f.id}
                        value={f.id}
                        disabled={isParentFolderAtLimit(f.id)}
                      >
                        {f.name}
                        {isParentFolderAtLimit(f.id) && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({t('folders.subFolderLimitReached')})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : folder ? (
                t('common.save')
              ) : (
                t('common.create')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};