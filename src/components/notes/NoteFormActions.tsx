import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface NoteFormActionsProps {
  isEditing: boolean;
  isUploading: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const NoteFormActions = ({ 
  isEditing, 
  isUploading,
  isSubmitting,
  onCancel, 
  onSubmit 
}: NoteFormActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="ghost" 
        onClick={onCancel}
        disabled={isUploading || isSubmitting}
      >
        {t('common.cancel')}
      </Button>
      <Button 
        onClick={onSubmit}
        disabled={isUploading || isSubmitting}
      >
        {isSubmitting 
          ? t('common.saving')
          : isUploading 
            ? t('common.uploading') 
            : isEditing 
              ? t('common.save') 
              : t('notes.create')}
      </Button>
    </div>
  );
};