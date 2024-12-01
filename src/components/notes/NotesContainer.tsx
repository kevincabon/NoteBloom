import { useState } from "react";
import { Note } from "@/types/note";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { useTranslation } from "react-i18next";
import { parseContent } from "@/utils/contentParser";
import { NoteMoveDialog } from "./NoteMoveDialog";
import { NoteListControls } from "./NoteListControls";
import { supabase } from "@/integrations/supabase/client";
import { useNotes } from "@/hooks/useNotes";
import { CreateNoteSection } from "./CreateNoteSection";
import { NoteList } from "./NoteList";
import { NoteEditDialog } from "./NoteEditDialog";
import { useQueryClient } from "@tanstack/react-query";

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
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { t } = useTranslation();
  const { isGuestMode } = useGuestMode();
  const { createNote, updateNote, deleteNote } = useNotes(initialNotes);
  const queryClient = useQueryClient();

  const handleCreateNote = async (title: string, content: string, images: string[], audioUrl: string | null, folderId: string | null) => {
    const { links, email, phone } = parseContent(content || "");
    
    const noteData = {
      title,
      content,
      links,
      phone,
      email,
      is_public: false,
      images,
      audio_url: audioUrl,
      folder_id: folderId || selectedFolderId,
    };

    if (isGuestMode) {
      onCreateNote(noteData);
    } else {
      await createNote(noteData);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  };

  const handleUpdateNote = async (note: Note, title: string, content: string, images: string[], audioUrl: string | null, folderId: string | null) => {
    if (!note) return;

    const { links, email, phone } = parseContent(content || "");

    const updatedNote = {
      ...note,
      title,
      content,
      links,
      phone,
      email,
      images,
      audio_url: audioUrl,
      folder_id: folderId,
    };

    if (isGuestMode) {
      onUpdateNote(updatedNote);
    } else {
      await updateNote(updatedNote);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }

    setSelectedNote(null);
    setIsEditDialogOpen(false);
  };

  const handleMoveNote = async (note: Note, newFolderId: string | null) => {
    try {
      const { error } = await supabase
        .from("notes")
        .update({ folder_id: newFolderId })
        .eq('id', note.id);

      if (error) throw error;

      const updatedNote = { ...note, folder_id: newFolderId };
      if (isGuestMode) {
        onUpdateNote(updatedNote);
      } else {
        await updateNote(updatedNote);
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      }

      setIsMoveDialogOpen(false);
    } catch (error) {
      console.error("Error moving note:", error);
    }
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditDialogOpen(true);
  };

  const handleDeleteNoteWithRefresh = async (id: string) => {
    if (isGuestMode) {
      onDeleteNote(id);
    } else {
      await deleteNote(id);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  };

  const filteredAndSortedNotes = initialNotes
    .filter((note) => {
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
      <CreateNoteSection onCreateNote={handleCreateNote} />

      <NoteListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={(value: "date" | "title") => setSortBy(value)}
      />

      <NoteList
        notes={filteredAndSortedNotes}
        onEdit={handleEditNote}
        onDelete={handleDeleteNoteWithRefresh}
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
        onUpdateNote={(images, audioUrl, folderId) => {
          if (selectedNote) {
            handleUpdateNote(selectedNote, selectedNote.title, selectedNote.content || "", images, audioUrl, folderId);
          }
        }}
      />
    </div>
  );
};