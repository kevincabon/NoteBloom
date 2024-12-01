import { useState } from "react";
import { Note } from "@/types/note";
import { useTranslation } from "react-i18next";
import { NoteMoveDialog } from "./NoteMoveDialog";
import { NoteListControls } from "./NoteListControls";
import { CreateNoteSection } from "./CreateNoteSection";
import { NoteList } from "./NoteList";
import { NoteEditDialog } from "./NoteEditDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalNotes } from "@/hooks/useLocalNotes";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useNoteOperations } from "./NoteOperations";
import { CurrentFolderHeader } from "./CurrentFolderHeader";

interface NotesContainerProps {
  notes: Note[];
  selectedFolderId: string | null;
  onCreateNote: (note: Omit<Note, "id" | "created_at" | "updated_at">) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesContainer = ({
  notes: initialNotes,
  selectedFolderId,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}: NotesContainerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { localNotes } = useLocalNotes(initialNotes, isGlobalSearch, searchQuery);
  const globalSearchResults = useGlobalSearch(searchQuery, isGlobalSearch);
  
  const {
    handleCreateNote,
    handleUpdateNote,
    handleMoveNote,
    handleDeleteNote,
  } = useNoteOperations({
    initialNotes,
    selectedFolderId,
    onCreateNote,
    onUpdateNote,
    onDeleteNote,
  });

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditDialogOpen(true);
  };

  const currentNotes = isGlobalSearch ? globalSearchResults : localNotes;

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
      
      <CreateNoteSection onCreateNote={handleCreateNote} />

      <NoteListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={(value: "date" | "title") => setSortBy(value)}
        isGlobalSearch={isGlobalSearch}
        onGlobalSearchChange={setIsGlobalSearch}
      />

      <NoteList
        notes={filteredAndSortedNotes}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        onMove={(note) => {
          setSelectedNote(note);
          setIsMoveDialogOpen(true);
        }}
      />

      <NoteMoveDialog
        isOpen={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        selectedNote={selectedNote}
        onMoveNote={handleMoveNote}
      />

      <NoteEditDialog
        note={selectedNote}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateNote={handleUpdateNote}
      />
    </div>
  );
};