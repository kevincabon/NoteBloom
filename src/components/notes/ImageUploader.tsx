import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const ImageUploader = ({ onFilesSelected, disabled }: ImageUploaderProps) => {
  const { t } = useTranslation();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    onFilesSelected(selectedFiles);
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => document.getElementById('image-upload')?.click()}
        disabled={disabled}
      >
        <ImagePlus className="w-4 h-4 mr-2" />
        {t('notes.addImage')}
      </Button>
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};