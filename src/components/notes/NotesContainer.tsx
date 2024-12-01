import { useState } from "react";
import { Note } from "@/types/note";
import { NoteListControls } from "./NoteListControls";
import { CreateNoteSection } from "./CreateNoteSection";
import { NoteList } from "./NoteList";
import { NoteEditDialog } from "./NoteEditDialog";
import { useLocalNotes } from "@/hooks/useLocalNotes";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useNoteOperations } from "./NoteOperations";
import { CurrentFolderHeader } from "./CurrentFolderHeader";
import { useNoteMutations } from "@/hooks/useNoteMutations";
import { useSharedNotes } from "@/hooks/useSharedNotes";
import { Tag } from "@/types/tag";

interface NotesContainerProps {
  notes: Note[];
  selectedFolderId: string | null;
  onCreateNote: (note: Omit<Note, "id" | "created_at" | "updated_at">) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  // Search and filter props
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  isGlobalSearch: boolean;
  onGlobalSearchChange: (value: boolean) => void;
  selectedTags: Tag[];
  onSelectTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
  isSharedView?: boolean;
}

export const NotesContainer = ({
  notes: initialNotes,
  selectedFolderId,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  // Search and filter props
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  isGlobalSearch,
  onGlobalSearchChange,
  selectedTags,
  onSelectTag,
  onRemoveTag,
  isSharedView = false,
}: NotesContainerProps) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Récupérer les notes partagées
  const { data: sharedNotes = [] } = useSharedNotes();

  const { localNotes } = useLocalNotes(initialNotes, isGlobalSearch, searchQuery, selectedTags);
  const globalSearchResults = useGlobalSearch(searchQuery, isGlobalSearch);
  
  const {
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote,
  } = useNoteOperations({
    initialNotes,
    selectedFolderId,
    onCreateNote,
    onUpdateNote,
    onDeleteNote,
  });

  const {
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
  } = useNoteMutations(handleCreateNote, handleUpdateNote, handleDeleteNote);

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditDialogOpen(true);
  };

  // Utiliser les notes partagées si isSharedView est true
  const currentNotes = isSharedView 
    ? sharedNotes 
    : isGlobalSearch 
      ? globalSearchResults 
      : localNotes;

  const filteredAndSortedNotes = currentNotes
    .filter((note) => {
      if (!searchQuery) return true;
      if (isGlobalSearch) return true;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(searchLower) ||
        (note.content?.toLowerCase() || "").includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <CurrentFolderHeader selectedFolderId={selectedFolderId} />
      
      {!isSharedView && (
        <CreateNoteSection 
          onCreateNote={async (title, content, images, audioUrl, folderId) => {
            await createNoteMutation.mutateAsync({
              title,
              content,
              images,
              audioUrl,
              folderId
            });
          }} 
        />
      )}

      <NoteListControls
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        isGlobalSearch={isGlobalSearch}
        onGlobalSearchChange={onGlobalSearchChange}
        selectedTags={selectedTags}
        onSelectTag={onSelectTag}
        onRemoveTag={onRemoveTag}
        showGlobalSearch={!isSharedView}
      />

      <NoteList
        notes={filteredAndSortedNotes}
        onEdit={handleEditNote}
        onDelete={async (id) => {
          await deleteNoteMutation.mutateAsync(id);
        }}
        isSharedView={isSharedView}
      />

      {!isSharedView && (
        <NoteEditDialog
          note={selectedNote}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdateNote={async (note) => {
            await updateNoteMutation.mutateAsync(note);
          }}
        />
      )}
    </div>
  );
};