import { Note } from "@/types/note";
import { NoteActions } from "./NoteActions";
import { FolderBadge } from "./FolderBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Share2, Lock, Unlock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useTranslation } from "react-i18next";
import { useNoteTags } from "@/hooks/useNoteTags";
import { useTags } from "@/hooks/useTags";
import { TagBadge } from "@/components/tags/TagBadge";
import { TagPicker } from "@/components/tags/TagPicker";
import { TagDialog } from "@/components/tags/TagDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NoteHeaderProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
  isSharedView?: boolean;
  onLock?: () => void;
  onUnlock?: () => void;
}

export const NoteHeader = ({
  note,
  onEdit,
  onDelete,
  isSharedView = false,
  onLock,
  onUnlock,
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
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-start justify-between w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold truncate">{note.title}</h2>
            {note.is_locked && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {!note.is_locked && (
            <div className="flex items-center gap-2 mt-2">
              {folder && (
                <FolderBadge name={folder.name} color={folder.color} />
              )}
              {isShared && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Share2 className="h-4 w-4" />
                        {t("notes.sharing.shared")}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("notes.sharing.sharedTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 ml-4">
          {!isSharedView && (
            <>
              {note.is_locked ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnlock?.();
                  }}
                >
                  <Unlock className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLock?.();
                    }}
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                  {onEdit && onDelete && (
                    <NoteActions
                      note={note}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {!isSharedView && !note.is_locked && (
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