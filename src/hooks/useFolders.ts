import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/components/auth/supabase-provider';

export const useFolders = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();

  const createFolder = async (data: { name: string; color?: string; parent_id?: string | null }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: result.error === 'Root folders limit reached' || result.error === 'Subfolders limit reached'
            ? t(result.error === 'Root folders limit reached' ? 'folders.limitReached' : 'folders.subFolderLimitReached')
            : t('folders.errors.createError'),
          description: result.message || t('errors.unknown'),
          variant: 'destructive',
        });
        return null;
      }

      // Invalider le cache des dossiers pour forcer un rechargement
      queryClient.invalidateQueries(['folders']);
      
      return result;
    } catch (error) {
      toast({
        title: t('folders.errors.createError'),
        description: t('errors.unknown'),
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFolder = async (id: string, data: { name: string; color?: string; parent_id?: string | null }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/folders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: result.error === 'Subfolders limit reached'
            ? t('folders.subFolderLimitReached')
            : t('folders.errors.updateError'),
          description: result.message || t('errors.unknown'),
          variant: 'destructive',
        });
        return null;
      }

      // Invalider le cache des dossiers pour forcer un rechargement
      queryClient.invalidateQueries(['folders']);
      
      return result;
    } catch (error) {
      toast({
        title: t('folders.errors.updateError'),
        description: t('errors.unknown'),
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      setIsLoading(true);

      // 1. Récupérer tous les sous-dossiers récursivement
      const { data: allSubFolders, error: subFoldersError } = await supabase
        .from('folders')
        .select('id')
        .eq('parent_id', folderId);

      if (subFoldersError) throw subFoldersError;

      // 2. Récupérer toutes les notes du dossier et des sous-dossiers
      const folderIds = [folderId, ...(allSubFolders?.map(f => f.id) || [])];
      
      // Récupérer d'abord toutes les notes concernées
      const { data: notesToDelete, error: notesQueryError } = await supabase
        .from('notes')
        .select('id')
        .in('folder_id', folderIds);

      if (notesQueryError) throw notesQueryError;

      if (notesToDelete && notesToDelete.length > 0) {
        // 3. Supprimer d'abord les liens de partage
        const { error: shareLinksError } = await supabase
          .from('note_shares')
          .delete()
          .in('note_id', notesToDelete.map(note => note.id));

        if (shareLinksError) throw shareLinksError;

        // 4. Ensuite supprimer les notes
        const { error: notesError } = await supabase
          .from('notes')
          .delete()
          .in('folder_id', folderIds);

        if (notesError) throw notesError;
      }

      // 5. Supprimer les sous-dossiers
      if (allSubFolders && allSubFolders.length > 0) {
        const { error: subFoldersDeleteError } = await supabase
          .from('folders')
          .delete()
          .in('id', allSubFolders.map(f => f.id));

        if (subFoldersDeleteError) throw subFoldersDeleteError;
      }

      // 6. Finalement, supprimer le dossier parent
      const { error: folderError } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (folderError) throw folderError;

      // 7. Mettre à jour l'état local
      queryClient.invalidateQueries(['folders']);
      queryClient.invalidateQueries(['notes']);
      
      toast({
        title: t('folders.deleted'),
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: t('folders.errors.deleteError'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createFolder,
    updateFolder,
    deleteFolder,
    isLoading,
  };
};
