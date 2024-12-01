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
import { AudioSection } from "./AudioSection";
import { useAudioHandling } from "./useAudioHandling";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder } from "lucide-react";

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
  
  const { data: folders = [] } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const {
    existingImages,
    previewImages,
    files,
    handleNewFiles,
    removeNewImage,
    removeExistingImage,
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
        <div className="flex items-center space-x-2">
          <Folder className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedFolderId || ""}
            onValueChange={(value) => setSelectedFolderId(value || null)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('notes.selectFolder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t('notes.noFolder')}
              </SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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