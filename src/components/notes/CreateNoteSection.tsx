import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NoteForm } from "./NoteForm";

interface CreateNoteSectionProps {
  onCreateNote: (title: string, content: string, images: string[], audioUrl: string | null, folderId: string | null) => void;
}

export const CreateNoteSection = ({ onCreateNote }: CreateNoteSectionProps) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { t } = useTranslation();

  const handleSubmit = async (images: string[], audioUrl: string | null, folderId: string | null) => {
    console.log("CreateNoteSection - Submitting with content:", content);
    // S'assurer que le contenu n'est jamais une chaîne vide
    const finalContent = content.trim() || null;
    await onCreateNote(title, finalContent, images, audioUrl, folderId);
    setIsFormVisible(false);
    setTitle("");
    setContent("");
  };

  return (
    <div>
      {!isFormVisible ? (
        <Button 
          onClick={() => setIsFormVisible(true)}
          className="w-full"
        >
          <Plus className="mr-2" />
          {t('notes.create')}
        </Button>
      ) : (
        <NoteForm
          title={title}
          content={content}
          editingNote={null}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onCancelEdit={() => {
            setIsFormVisible(false);
            setTitle("");
            setContent("");
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};