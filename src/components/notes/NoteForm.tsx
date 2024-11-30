import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/note";
import { useTranslation } from "react-i18next";
import { ImagePlus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

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
  const [previewImages, setPreviewImages] = useState<string[]>(editingNote?.images || []);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Preview images
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewUrls]);
    setFiles([...files, ...selectedFiles]);
  };

  const removeImage = (index: number) => {
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);

    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      const uploadedImageUrls: string[] = [...(editingNote?.images || [])];

      // Upload new files
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
      
      {/* Image upload section */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          {previewImages.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt=""
                className="w-24 h-24 object-cover rounded-md"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
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