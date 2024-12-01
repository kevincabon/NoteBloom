import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/types/tag";
import { useTags } from "@/hooks/useTags";
import { TagDialog } from "./TagDialog";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRoleLimits } from "@/hooks/useRoleLimits";
import { LimitUsage } from "@/components/ui/LimitUsage";

export const TagManager = () => {
  const { t } = useTranslation();
  const { tags, createTag, updateTag, deleteTag } = useTags();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const { limits, isLoading, canCreateMoreTags } = useRoleLimits();

  console.log("TagManager state:", {
    tagsCount: tags.length,
    limits,
    isLoading
  });

  const handleCreateTag = (newTag: Pick<Tag, "name" | "color">) => {
    createTag(newTag);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateTag = (updates: Pick<Tag, "name" | "color">) => {
    if (editingTag) {
      updateTag({ id: editingTag.id, ...updates });
      setEditingTag(null);
    }
  };

  const handleDeleteTag = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete.id);
      setTagToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("tags.title")}</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={isLoading || !canCreateMoreTags(tags.length)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("tags.create")}
        </Button>
      </div>

      {!isLoading && (
        <LimitUsage
          current={tags.length}
          max={limits?.max_tags ?? 0}
          className="mb-4"
          type={t("limits.types.tags")}
        />
      )}

      {!isLoading && !canCreateMoreTags(tags.length) && (
        <div className="text-sm text-destructive mb-4">
          {t("limits.maxTagsReached")}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("tags.name")}</TableHead>
            <TableHead>{t("tags.color")}</TableHead>
            <TableHead className="w-[100px]">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell className="font-medium">{tag.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.color}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingTag(tag)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setTagToDelete(tag);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TagDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTag}
      />

      <TagDialog
        tag={editingTag}
        isOpen={!!editingTag}
        onOpenChange={(open) => !open && setEditingTag(null)}
        onSubmit={handleUpdateTag}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("tags.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("tags.deleteConfirmDescription", {
                tag: tagToDelete?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
