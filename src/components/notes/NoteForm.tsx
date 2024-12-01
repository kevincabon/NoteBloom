import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Note } from "@/types/note";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { ImageList } from "./ImageList";
import { useImageHandling } from "./useImageHandling";
import { RichTextEditor } from "./RichTextEditor";
import { AudioSection } from "./AudioSection";
import { useAudioHandling } from "./useAudioHandling";
import { FolderSelect } from "./FolderSelect";
import { NoteFormActions } from "./NoteFormActions";

interface NoteFormProps {
  title: string;
  content: string;
  editingNote: Note | null;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCancelEdit: () => void;
  onSubmit: (images: string[], audioUrl: string | null, folderId: string | null) => void;
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
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(editingNote?.folder_id || null);

  const {
    existingImages,
    previewImages,
    files,
    handleNewFiles,
    removeNewImage,
    removeExistingImage,
    addImageUrl,
  } = useImageHandling(editingNote?.images || []);

  const {
    audioUrl,
    handleNewAudio,
    handleDeleteAudio,
  } = useAudioHandling(editingNote?.audio_url || null);

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

      onSubmit(uploadedImageUrls, audioUrl, selectedFolderId);
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
      
      <RichTextEditor
        content={content}
        onChange={onContentChange}
        placeholder={t('notes.contentPlaceholder')}
      />
      
      <div className="space-y-4">
        <FolderSelect
          selectedFolderId={selectedFolderId}
          onFolderChange={setSelectedFolderId}
        />

        <AudioSection
          audioUrl={audioUrl}
          onNewAudio={handleNewAudio}
          onDeleteAudio={handleDeleteAudio}
        />

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
          onUrlAdded={addImageUrl}
          disabled={uploading}
        />
      </div>

      <NoteFormActions
        isEditing={!!editingNote}
        isUploading={uploading}
        onCancel={onCancelEdit}
        onSubmit={handleSubmit}
      />
    </Card>
  );
};