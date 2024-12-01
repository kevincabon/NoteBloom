import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

export const useImageHandling = (initialImages: string[] = []) => {
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Synchroniser les images existantes lorsque initialImages change
  useEffect(() => {
    setExistingImages(initialImages);
  }, [initialImages]);

  const handleNewFiles = (selectedFiles: File[]) => {
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewUrls]);
    setFiles([...files, ...selectedFiles]);
  };

  const removeNewImage = (index: number) => {
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);

    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const removeExistingImage = async (index: number) => {
    try {
      const imageUrl = existingImages[index];
      const path = imageUrl.split('/').pop();
      if (!path) return;

      const { error: deleteError } = await supabase.storage
        .from('notes-images')
        .remove([path]);

      if (deleteError) {
        toast({
          title: t('notes.errors.imageDeleteFailed'),
          variant: "destructive",
        });
        return;
      }

      const newExistingImages = [...existingImages];
      newExistingImages.splice(index, 1);
      setExistingImages(newExistingImages);
    } catch (error) {
      toast({
        title: t('notes.errors.imageDeleteFailed'),
        variant: "destructive",
      });
    }
  };

  return {
    existingImages,
    previewImages,
    files,
    handleNewFiles,
    removeNewImage,
    removeExistingImage,
    setFiles,
    setPreviewImages,
    setExistingImages,
  };
};