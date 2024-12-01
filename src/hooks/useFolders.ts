import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

export const useFolders = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

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

  return {
    createFolder,
    updateFolder,
    isLoading,
  };
};
