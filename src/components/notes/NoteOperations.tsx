import { Note } from "@/types/note";
import { parseContent } from "@/utils/contentParser";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { useNotes } from "@/hooks/useNotes";
import { supabase } from "@/integrations/supabase/client";

interface NoteOperationsProps {
  initialNotes: Note[];
  selectedFolderId: string | null;
  onCreateNote: (note: Omit<Note, "id" | "created_at" | "updated_at">) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export const useNoteOperations = ({
  initialNotes,
  selectedFolderId,
  onCreateNote: propOnCreateNote,
  onUpdateNote: propOnUpdateNote,
  onDeleteNote: propOnDeleteNote,
}: NoteOperationsProps) => {
  const { isGuestMode } = useGuestMode();
  const { createNote, updateNote, deleteNote } = useNotes(initialNotes);

  const handleCreateNote = async (
    title: string,
    content: string,
    images: string[],
    audioUrl: string | null,
    folderId: string | null
  ) => {
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
      propOnCreateNote(noteData);
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
      propOnUpdateNote(noteToUpdate);
    } else {
      await updateNote(noteToUpdate);
    }
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
        propOnUpdateNote(updatedNote);
      } else {
        await updateNote(updatedNote);
      }
    } catch (error) {
      console.error("Error moving note:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (isGuestMode) {
      propOnDeleteNote(id);
    } else {
      await deleteNote(id);
    }
  };

  return {
    handleCreateNote,
    handleUpdateNote,
    handleMoveNote,
    handleDeleteNote,
  };
};