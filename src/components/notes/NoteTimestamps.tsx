import { Calendar, RefreshCw } from "lucide-react";

interface NoteTimestampsProps {
  createdAt: string;
  updatedAt: string;
}

export const NoteTimestamps = ({ createdAt, updatedAt }: NoteTimestampsProps) => {
  return (
    <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span>Créé le {new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(createdAt))}</span>
      </div>
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        <span>Modifié le {new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(updatedAt))}</span>
      </div>
    </div>
  );
};