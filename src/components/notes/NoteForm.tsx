import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/note";
import { useTranslation } from "react-i18next";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ImagePreview } from "./ImagePreview";

interface NoteFormProps {
  title: string;
  content: string;
  editingNote: Note | null;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCancelEdit: () => void;
  onSubmit: (images: string[]) => void;
}

export const NoteForm = ({
  title,
  content,
  editingNote,
  onTitleChange,
  onContentChange,
  onCancelEdit,
  onSubmit,
}: NoteFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>(editingNote?.images || []);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

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

  const handleSubmit = async () => {
    try {
      setUploading(true);
      const uploadedImageUrls: string[] = [...existingImages];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('notes-images')
          .upload(filePath, file);

        if (uploadError) {
          toast({
            title: t('notes.errors.imageUploadFailed'),
            variant: "destructive",
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('notes-images')
          .getPublicUrl(filePath);

        uploadedImageUrls.push(publicUrl);
      }

      onSubmit(uploadedImageUrls);
      setFiles([]);
      setPreviewImages([]);
      setExistingImages([]);
    } catch (error) {
      toast({
        title: t('notes.errors.imageUploadFailed'),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 animate-fade-in">
      <Input
        placeholder={t('notes.titlePlaceholder')}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="text-lg font-medium"
        maxLength={100}
      />
      <Textarea
        placeholder={t('notes.contentPlaceholder')}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="min-h-[200px] resize-none"
        maxLength={1000}
      />
      
      <div className="space-y-4">
        {existingImages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">{t('notes.existingImages')}</h4>
            <div className="flex flex-wrap gap-4">
              {existingImages.map((url, index) => (
                <ImagePreview
                  key={`existing-${index}`}
                  url={url}
                  onRemove={() => removeExistingImage(index)}
                />
              ))}
            </div>
          </div>
        )}

        {previewImages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">{t('notes.newImages')}</h4>
            <div className="flex flex-wrap gap-4">
              {previewImages.map((url, index) => (
                <ImagePreview
                  key={`new-${index}`}
                  url={url}
                  onRemove={() => removeNewImage(index)}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading}
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
      </div>

      <div className="flex justify-end gap-2">
        {editingNote && (
          <Button 
            variant="ghost" 
            onClick={onCancelEdit}
            disabled={uploading}
          >
            {t('common.cancel')}
          </Button>
        )}
        <Button 
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? t('common.uploading') : editingNote ? t('common.save') : t('notes.create')}
        </Button>
      </div>
    </Card>
  );
};