import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NoteForm } from "./NoteForm";

interface CreateNoteSectionProps {
  onCreateNote: (images: string[], audioUrl: string | null) => void;
}

export const CreateNoteSection = ({ onCreateNote }: CreateNoteSectionProps) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (images: string[], audioUrl: string | null) => {
    await onCreateNote(images, audioUrl);
    setIsFormVisible(false);
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
          title=""
          content=""
          editingNote={null}
          onTitleChange={() => {}}
          onContentChange={() => {}}
          onCancelEdit={() => setIsFormVisible(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};