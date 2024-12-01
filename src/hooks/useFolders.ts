import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/components/auth/supabase-provider';
import { Folder } from '@/types/folder';

interface Folder {
  id: string;
  // Add other properties as needed
}

export const useFolders = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();

  const createFolder = async (data: { name: string; color?: string; parent_id?: string | null }) => {
    setIsLoading(true);
    try {
      const { data: newFolder, error } = await supabase
        .from('folders')
        .insert([{
          name: data.name,
          color: data.color,
          parent_id: data.parent_id === "none" ? null : data.parent_id
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating folder:", error);
        toast({
          title: error.message.includes('limit reached')
            ? t(error.message.includes('Root') ? 'folders.limitReached' : 'folders.subFolderLimitReached')
            : t('folders.errors.createError'),
          description: error.message || t('errors.unknown'),
          variant: 'destructive',
        });
        return null;
      }

      // Invalider le cache des dossiers pour forcer un rechargement
      queryClient.invalidateQueries(['folders']);
      
      return newFolder;
    } catch (error) {
      console.error("Error in createFolder:", error);
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
      const { data: updatedFolder, error } = await supabase
        .from('folders')
        .update({
          name: data.name,
          color: data.color,
          parent_id: data.parent_id === "none" ? null : data.parent_id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating folder:", error);
        toast({
          title: error.message.includes('limit reached')
            ? t('folders.subFolderLimitReached')
            : t('folders.errors.updateError'),
          description: error.message || t('errors.unknown'),
          variant: 'destructive',
        });
        return null;
      }

      // Invalider le cache des dossiers pour forcer un rechargement
      queryClient.invalidateQueries(['folders']);
      
      return updatedFolder;
    } catch (error) {
      console.error("Error in updateFolder:", error);
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

  const getFolderById = async (id: string) => {
    const { data: folder, error } = await supabase
      .from('folders')
      .select('id, name, description, color, user_id, parent_id, created_at, updated_at')
      .eq('id', id)
      .returns<Folder>()
      .maybeSingle();

    if (error) {
      console.error('Error fetching folder:', error);
      return null;
    }

    return folder;
  };

  const deleteFolder = async (folderId: string) => {
    try {
      setIsLoading(true);

      // 1. Vérifier si le dossier existe
      const { data: folder, error: folderError } = await supabase
        .from('folders')
        .select('id, name, description, color, user_id, parent_id, created_at, updated_at')
        .eq('id', folderId)
        .returns<Folder>()
        .maybeSingle();

      if (folderError || !folder) {
        throw new Error('Folder not found');
      }

      // 2. Récupérer tous les sous-dossiers récursivement
      const { data: allSubFolders, error: subFoldersError } = await supabase
        .from('folders')
        .select('id, name, description, color, user_id, parent_id, created_at, updated_at')
        .eq('parent_id', folderId)
        .returns<Array<Folder>>();

      if (subFoldersError) throw subFoldersError;

      // 3. Récupérer toutes les notes du dossier et des sous-dossiers
      const folderIds = [folderId, ...(allSubFolders?.map(f => f.id) || [])];
      
      // Récupérer d'abord toutes les notes concernées
      const { data: notesToDelete, error: notesQueryError } = await supabase
        .from('notes')
        .select('id')
        .in('folder_id', folderIds)
        .returns<Array<{ id: string }>>();

      if (notesQueryError) throw notesQueryError;

      // 4. Supprimer les notes et les liens de partage
      if (notesToDelete && notesToDelete.length > 0) {
        const noteIds = notesToDelete.map(note => note.id);
        
        // 4.1 Supprimer les liens de partage
        const { error: shareLinksError } = await supabase
          .from('note_shares')
          .delete()
          .in('note_id', noteIds)
          .returns<null>();

        if (shareLinksError) throw shareLinksError;

        // 4.2 Supprimer les notes
        const { error: notesError } = await supabase
          .from('notes')
          .delete()
          .in('folder_id', folderIds)
          .returns<null>();

        if (notesError) throw notesError;
      }

      // 5. Supprimer les sous-dossiers
      if (allSubFolders && allSubFolders.length > 0) {
        const { error: subFoldersDeleteError } = await supabase
          .from('folders')
          .delete()
          .in('id', allSubFolders.map(f => f.id))
          .returns<null>();

        if (subFoldersDeleteError) throw subFoldersDeleteError;
      }

      // 6. Finalement, supprimer le dossier parent
      const { error: folderDeleteError } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)
        .returns<null>();

      if (folderDeleteError) throw folderDeleteError;

      // 7. Mettre à jour l'état local
      await queryClient.invalidateQueries(['folders']);
      await queryClient.invalidateQueries(['notes']);
      
      toast({
        title: t('folders.deleted'),
        variant: 'default'
      });

      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: t('folders.errors.deleteError'),
        description: error instanceof Error ? error.message : t('errors.unknown'),
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createFolder,
    updateFolder,
    getFolderById,
    deleteFolder,
    isLoading,
  };
};
