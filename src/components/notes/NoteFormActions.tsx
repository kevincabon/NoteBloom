import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface NoteFormActionsProps {
  isEditing: boolean;
  isUploading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const NoteFormActions = ({ 
  isEditing, 
  isUploading, 
  onCancel, 
  onSubmit 
}: NoteFormActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end gap-2">
      {isEditing && (
        <Button 
          variant="ghost" 
          onClick={onCancel}
          disabled={isUploading}
        >
          {t('common.cancel')}
        </Button>
      )}
      <Button 
        onClick={onSubmit}
        disabled={isUploading}
      >
        {isUploading ? t('common.uploading') : isEditing ? t('common.save') : t('notes.create')}
      </Button>
    </div>
  );
};