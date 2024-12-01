import { useState, useEffect } from "react";
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
import { useNotesRealtime } from "@/hooks/useNotesRealtime";

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
  const [localNotes, setLocalNotes] = useState<Note[]>(initialNotes);
  const { t } = useTranslation();
  const { isGuestMode } = useGuestMode();
  const { createNote, updateNote, deleteNote } = useNotes(initialNotes);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isGlobalSearch) {
      setLocalNotes(initialNotes);
    }
  }, [initialNotes, isGlobalSearch]);

  useNotesRealtime(setLocalNotes, initialNotes);

  useEffect(() => {
    const fetchAllNotes = async () => {
      if (isGlobalSearch && searchQuery && !isGuestMode) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", user.id)
          .ilike("title", `%${searchQuery}%`)
          .order("created_at", { ascending: false });

        if (data) {
          setLocalNotes(data);
        }
      }
    };

    fetchAllNotes();
  }, [isGlobalSearch, searchQuery, isGuestMode]);

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
    }
  };

  const handleUpdateNote = async (updatedNote: Note) => {
    const { links, email, phone } = parseContent(updatedNote.content || "");

    const noteToUpdate = {
      ...updatedNote,
      links,
      phone,
      email,
    };

    if (isGuestMode) {
      onUpdateNote(noteToUpdate);
    } else {
      await updateNote(noteToUpdate);
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
    }
  };

  const filteredAndSortedNotes = localNotes
    .filter((note) => {
      if (!searchQuery) return true;
      if (isGlobalSearch) return true; // Déjà filtré par la requête Supabase
      
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
        isGlobalSearch={isGlobalSearch}
        onGlobalSearchChange={setIsGlobalSearch}
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
        onUpdateNote={handleUpdateNote}
      />
    </div>
  );
};
