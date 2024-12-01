import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/note";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { ImageList } from "./ImageList";
import { useImageHandling } from "./useImageHandling";
import { RichTextEditor } from "./RichTextEditor";
import { AudioRecorder } from "./AudioRecorder";
import { AudioPlayer } from "./AudioPlayer";

interface NoteFormProps {
  title: string;
  content: string;
  editingNote: Note | null;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCancelEdit: () => void;
  onSubmit: (images: string[], audioUrl: string | null) => void;
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
  const [audioUrl, setAudioUrl] = useState<string | null>(editingNote?.audio_url || null);
  
  const {
    existingImages,
    previewImages,
    files,
    handleNewFiles,
    removeNewImage,
    removeExistingImage,
  } = useImageHandling(editingNote?.images || []);

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

      onSubmit(uploadedImageUrls, audioUrl);
    } catch (error) {
      toast({
        title: t('notes.errors.imageUploadFailed'),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAudio = () => {
    setAudioUrl(null);
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
      
      <RichTextEditor
        content={content}
        onChange={onContentChange}
        placeholder={t('notes.contentPlaceholder')}
      />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{t('notes.audioRecording')}</h3>
          {audioUrl ? (
            <AudioPlayer url={audioUrl} onDelete={handleDeleteAudio} />
          ) : (
            <AudioRecorder onAudioSaved={setAudioUrl} />
          )}
        </div>

        <ImageList
          title={t('notes.existingImages')}
          images={existingImages}
          onRemove={removeExistingImage}
        />

        <ImageList
          title={t('notes.newImages')}
          images={previewImages}
          onRemove={removeNewImage}
        />
        
        <ImageUploader
          onFilesSelected={handleNewFiles}
          disabled={uploading}
        />
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