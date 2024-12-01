import { Calendar, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { User } from "@/types/user";

interface NoteTimestampsProps {
  createdAt: string | null;
  updatedAt: string | null;
  owner?: User | null;
}

export const NoteTimestamps = ({ createdAt, updatedAt, owner }: NoteTimestampsProps) => {
  const { t, i18n } = useTranslation();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('common.unknown');
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dateString));
    } catch (error) {
      console.error("Error formatting date:", error);
      return t('common.unknown');
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span>{t('common.createdAt')} {formatDate(createdAt)}</span>
      </div>
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        <span>{t('common.updatedAt')} {formatDate(updatedAt)}</span>
      </div>
    </div>
  );
};