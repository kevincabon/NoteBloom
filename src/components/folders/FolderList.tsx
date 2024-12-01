import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FolderDialog } from "./FolderDialog";
import { FolderTreeItem } from "./FolderTreeItem";
import { useFolderHierarchy } from "@/hooks/useFolderHierarchy";
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

  // Utiliser localStorage pour persister l'état des dossiers développés
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('expandedFolders');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Sauvegarder l'état des dossiers développés
  useEffect(() => {
    localStorage.setItem('expandedFolders', JSON.stringify(Array.from(expandedFolders)));
  }, [expandedFolders]);

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

  // Compte les dossiers racine
  const getRootFoldersCount = (folders: Folder[]) => {
    return folders.filter(f => !f.parent_id).length;
  };

  // Compte les sous-dossiers pour un dossier parent donné
  const getSubFoldersCount = (parentId: string) => {
    return folders.filter(f => f.parent_id === parentId).length;
  };

  // Vérifie si un dossier peut avoir plus de sous-dossiers
  const canAddSubFolder = (parentId: string) => {
    return getSubFoldersCount(parentId) < MAX_SUBFOLDERS;
  };

  const renderFolderTree = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    const canAddMore = canAddSubFolder(folder.id);

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
          onDelete={() => onDeleteFolder(folder.id)}
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

  const rootFolderCount = folders.filter(f => !f.parent_id).length;
  const canCreateFolder = !selectedFolderId 
    ? rootFolderCount < MAX_ROOT_FOLDERS  // Limite uniquement pour les dossiers racine
    : folders.filter(f => f.parent_id === selectedFolderId).length < MAX_SUBFOLDERS; // Limite pour les sous-dossiers

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
          disabled={!canCreateFolder}
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
        />
      )}

      {editingFolder && (
        <FolderDialog
          isOpen={!!editingFolder}
          onOpenChange={() => setEditingFolder(null)}
          onSubmit={(data) => {
            onUpdateFolder(editingFolder.id, data);
            setEditingFolder(null);
          }}
          folders={folders.filter(f => f.id !== editingFolder.id)}
          folder={editingFolder}
        />
      )}
    </div>
  );
};