import { Note } from "@/types/note";
import { NoteActions } from "./NoteActions";
import { FolderBadge } from "./FolderBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NoteHeaderProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onMove: (note: Note) => void;
}

export const NoteHeader = ({ note, onEdit, onDelete, onMove }: NoteHeaderProps) => {
  const { data: folder } = useQuery({
    queryKey: ['folder', note.folder_id],
    queryFn: async () => {
      if (!note.folder_id) return null;
      const { data } = await supabase
        .from('folders')
        .select('name, color')
        .eq('id', note.folder_id)
        .single();
      return data;
    },
    enabled: !!note.folder_id,
  });

  return (
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{note.title}</h3>
        {folder && (
          <FolderBadge name={folder.name} color={folder.color} />
        )}
      </div>
      <NoteActions
        note={note}
        onEdit={onEdit}
        onDelete={onDelete}
        onMove={onMove}
      />
    </div>
  );
};