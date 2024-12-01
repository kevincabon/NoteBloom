import { Note } from "@/types/note";
import { NoteActions } from "./NoteActions";
import { FolderBadge } from "./FolderBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Share2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useTranslation } from "react-i18next";
import { useNoteTags } from "@/hooks/useNoteTags";
import { useTags } from "@/hooks/useTags";
import { TagBadge } from "@/components/tags/TagBadge";
import { TagPicker } from "@/components/tags/TagPicker";
import { TagDialog } from "@/components/tags/TagDialog";
import { useState } from "react";

interface NoteHeaderProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
  isSharedView?: boolean;
}

export const NoteHeader = ({
  note,
  onEdit,
  onDelete,
  isSharedView = false,
}: NoteHeaderProps) => {
  const { t } = useTranslation();
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
    enabled: !!note.folder_id && !isSharedView,
  });

  const { data: isShared } = useQuery({
    queryKey: ['note_shares', note.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('note_shares')
        .select('*', { count: 'exact', head: true})
        .eq('note_id', note.id);
      return Boolean(count && count > 0);
    },
    enabled: !isSharedView && !!note.id,
  });

  const { tags: allTags, createTag } = useTags();
  const { tags: noteTags, addTag, removeTag } = useNoteTags(note.id);
  const [showTagDialog, setShowTagDialog] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{note.title}</h2>
            <div className="flex items-center gap-2">
              {!isSharedView && isShared && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('notes.shared.indicator', 'Cette note est partagée')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {isSharedView && note.owner && (
              <p className="text-sm text-muted-foreground">
                {t('notes.shared.owner', 'Partagée par')} {note.owner}
              </p>
            )}
            {!isSharedView && folder && (
              <FolderBadge name={folder.name} color={folder.color} />
            )}
          </div>
        </div>
        {!isSharedView && onEdit && onDelete && (
          <NoteActions
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>

      {!isSharedView && (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            {noteTags && noteTags.length > 0 && noteTags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                onRemove={() => removeTag(tag.id)}
              />
            ))}
            <TagPicker
              tags={allTags}
              selectedTags={noteTags}
              onSelect={(tag) => {
                const isSelected = noteTags.some((t) => t.id === tag.id);
                if (isSelected) {
                  removeTag(tag.id);
                } else {
                  addTag(tag.id);
                }
              }}
              onCreate={() => setShowTagDialog(true)}
            />
          </div>

          <TagDialog
            isOpen={showTagDialog}
            onOpenChange={setShowTagDialog}
            onSubmit={createTag}
          />
        </>
      )}
    </div>
  );
};