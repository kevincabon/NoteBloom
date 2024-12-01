import { Folder } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFolderHierarchy } from "@/hooks/useFolderHierarchy";
import { type FolderWithChildren } from "@/types/folder";
import { useEffect, useState } from "react";

interface FolderSelectProps {
  selectedFolderId: string | null;
  onFolderChange: (folderId: string | null) => void;
}

export const FolderSelect = ({ selectedFolderId, onFolderChange }: FolderSelectProps) => {
  const { t } = useTranslation();
  const { folders, isLoading } = useFolderHierarchy();
  const [internalValue, setInternalValue] = useState<string>(selectedFolderId || "no-folder");

  // Mettre à jour la valeur interne quand selectedFolderId change
  useEffect(() => {
    setInternalValue(selectedFolderId || "no-folder");
  }, [selectedFolderId]);

  // Fonction récursive pour générer les options de dossiers
  const getFolderOptions = (folders: FolderWithChildren[], level = 0): JSX.Element[] => {
    return folders.reduce<JSX.Element[]>((acc, folder) => {
      const prefix = level === 0 ? "" : level === 1 ? "└ " : "  └ ";
      return [
        ...acc,
        <SelectPrimitive.Item 
          key={folder.id} 
          value={folder.id}
          className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        >
          <SelectPrimitive.ItemText>{prefix + folder.name}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>,
        ...(folder.children ? getFolderOptions(folder.children, level + 1) : []),
      ];
    }, []);
  };

  // Vérifier si le dossier sélectionné existe dans la liste
  const folderExists = (folderId: string | null): boolean => {
    if (!folderId || folderId === "no-folder") return true;
    const checkFolder = (folders: FolderWithChildren[]): boolean => {
      return folders.some(folder => 
        folder.id === folderId || 
        (folder.children && checkFolder(folder.children))
      );
    };
    return checkFolder(folders);
  };

  // Si le dossier sélectionné n'existe pas, réinitialiser à "no-folder"
  useEffect(() => {
    if (selectedFolderId && !folderExists(selectedFolderId)) {
      onFolderChange(null);
    }
  }, [selectedFolderId, folders]);

  const handleValueChange = (value: string) => {
    setInternalValue(value);
    onFolderChange(value === "no-folder" ? null : value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Folder className="h-4 w-4 text-muted-foreground" />
        <div className="w-[200px] h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Folder className="h-4 w-4 text-muted-foreground" />
      <SelectPrimitive.Root value={internalValue} onValueChange={handleValueChange}>
        <SelectPrimitive.Trigger
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            "w-[200px]"
          )}
        >
          <SelectPrimitive.Value placeholder={t('notes.selectFolder')} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            className="z-[9999] relative max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          >
            <SelectPrimitive.Viewport className="p-1">
              <SelectPrimitive.Item 
                value="no-folder"
                className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <SelectPrimitive.ItemText>{t('notes.noFolder')}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
              {getFolderOptions(folders)}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
};