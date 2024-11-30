import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/note";
import { useTranslation } from "react-i18next";

interface NoteFormProps {
  title: string;
  content: string;
  editingNote: Note | null;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCancelEdit: () => void;
}

export const NoteForm = ({
  title,
  content,
  editingNote,
  onTitleChange,
  onContentChange,
  onCancelEdit,
}: NoteFormProps) => {
  const { t } = useTranslation();

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
      {editingNote && (
        <Button 
          variant="ghost" 
          onClick={onCancelEdit}
        >
          {t('common.cancel')}
        </Button>
      )}
    </Card>
  );
};