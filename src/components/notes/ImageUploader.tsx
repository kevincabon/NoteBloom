import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Link } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onUrlAdded: (url: string) => void;
  disabled?: boolean;
}

export const ImageUploader = ({ onFilesSelected, onUrlAdded, disabled }: ImageUploaderProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    onFilesSelected(selectedFiles);
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      toast({
        title: t('notes.errors.invalidUrl'),
        variant: "destructive",
      });
      return;
    }

    onUrlAdded(imageUrl.trim());
    setImageUrl("");
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-4">
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
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={disabled}
        >
          <Link className="w-4 h-4 mr-2" />
          {t('notes.addImageUrl')}
        </Button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder={t('notes.imageUrlPlaceholder')}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleUrlSubmit} disabled={disabled}>
            {t('common.add')}
          </Button>
        </div>
      )}

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