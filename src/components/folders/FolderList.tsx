import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FolderDialog } from "./FolderDialog";
import { FolderTreeItem } from "./FolderTreeItem";
import { useFolderHierarchy } from "@/hooks/useFolderHierarchy";
import { useFolders } from "@/hooks/useFolders";
import { useRoleLimits } from "@/hooks/useRoleLimits";
import { useSupabase } from "@/components/auth/supabase-provider";
import { Folder } from "@/types/folder";
import { cn } from "@/lib/utils";

const MAX_ROOT_FOLDERS = 6;
const MAX_SUBFOLDERS = 3;

interface FolderListProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (data: { name: string; color?: string; parent_id?: string | null }) => void;
  onUpdateFolder: (folderId: string, data: { name: string; color?: string; parent_id?: string | null }) => void;
  onDeleteFolder: (folderId: string) => void;
  onSelectSharedNotes?: () => void;
  isSharedNotesSelected?: boolean;
}

export const FolderList = ({
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onSelectSharedNotes,
  isSharedNotesSelected = false,
}: FolderListProps) => {
  const { t } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const { folders, isLoading } = useFolderHierarchy();
  const { createFolder, updateFolder, deleteFolder } = useFolders();
  const { canCreateMoreRootFolders, canCreateMoreSubfolders } = useRoleLimits();
  const { user } = useSupabase();

  // Utiliser localStorage pour persister l'état des dossiers développés
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('expandedFolders');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Sauvegarder l'état des dossiers développés
  useEffect(() => {
    localStorage.setItem('expandedFolders', JSON.stringify(Array.from(expandedFolders)));
  }, [expandedFolders]);

  // Fonction pour vérifier si on peut créer un dossier
  const canCreateFolder = (parentId: string | null) => {
    if (!folders) return false;
    
    if (!parentId) {
      const rootFolders = folders.filter(f => !f.parent_id);
      return canCreateMoreRootFolders(rootFolders.length);
    } else {
      const subFolders = folders.filter(f => f.parent_id === parentId);
      return canCreateMoreSubfolders(subFolders.length);
    }
  };

  const handleToggleExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
      // Développer tous les parents
      let currentFolder = folders.find(f => f.id === folderId);
      while (currentFolder?.parent_id) {
        newExpanded.add(currentFolder.parent_id);
        currentFolder = folders.find(f => f.id === currentFolder.parent_id);
      }
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateClick = () => {
    setShowCreateDialog(true);
  };

  const handleDeleteFolder = async (folderId: string) => {
    await deleteFolder(folderId);
  };

  const renderFolderTree = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    const canAddMore = canCreateFolder(folder.id);

    return (
      <div key={folder.id} className="w-full">
        <FolderTreeItem
          folder={folder}
          level={level}
          isSelected={selectedFolderId === folder.id}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onSelect={() => onSelectFolder(folder.id)}
          onToggleExpand={() => handleToggleExpand(folder.id)}
          onEdit={() => setEditingFolder(folder)}
          onDelete={() => handleDeleteFolder(folder.id)}
          subFolders={folders}
        >
          {hasChildren && (
            <ChevronRight 
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                isExpanded && "transform rotate-90"
              )}
            />
          )}
          {!hasChildren && <div className="w-4" />}
        </FolderTreeItem>
        {hasChildren && isExpanded && (
          <div className="ml-[0.5rem]">
            {folder.children.map(child => renderFolderTree(child, level + 1))}
            {!canAddMore && (
              <div className="text-sm text-muted-foreground text-center p-2 ml-6">
                {t('folders.subFolderLimitReached')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleUpdateFolder = async (data: { name: string; color?: string; parent_id?: string | null }) => {
    await updateFolder(editingFolder.id, data);
    setEditingFolder(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className={`w-full justify-start ${selectedFolderId === null && !isSharedNotesSelected ? 'bg-accent' : ''}`}
          onClick={() => onSelectFolder(null)}
        >
          {t('folders.all')}
        </Button>
        
        {onSelectSharedNotes && (
          <Button
            variant="ghost"
            className={`w-full justify-start ${isSharedNotesSelected ? 'bg-accent' : ''}`}
            onClick={onSelectSharedNotes}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t('folders.sharedWithMe')}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleCreateClick}
          disabled={!canCreateFolder(null)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('folders.createFolder')}
        </Button>
      </div>

      <div className="space-y-1">
        {folders.filter(f => !f.parent_id).map(folder => renderFolderTree(folder))}
      </div>

      {showCreateDialog && (
        <FolderDialog
          isOpen={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={onCreateFolder}
          folders={folders}
          user={user}
        />
      )}

      {editingFolder && (
        <FolderDialog
          folder={editingFolder}
          isOpen={!!editingFolder}
          onOpenChange={(open) => !open && setEditingFolder(null)}
          onSubmit={handleUpdateFolder}
          folders={folders}
          user={user}
        />
      )}
    </div>
  );
};