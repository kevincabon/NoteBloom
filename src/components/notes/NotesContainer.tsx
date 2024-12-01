import { useState } from "react";
import { Note } from "@/types/note";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteCard } from "@/components/notes/NoteCard";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { useTranslation } from "react-i18next";
import { parseContent } from "@/utils/contentParser";
import { NoteMoveDialog } from "./NoteMoveDialog";
import { NoteListControls } from "./NoteListControls";
import { supabase } from "@/integrations/supabase/client";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { t } = useTranslation();
  const { isGuestMode } = useGuestMode();
  const { createNote, updateNote, deleteNote } = useNotes(initialNotes);

  const handleCreateNote = async (images: string[], audioUrl: string | null) => {
    if (!title.trim()) return;

    const { links, email, phone } = parseContent(content);
    
    const noteData = {
      title: title.trim(),
      content: content.trim(),
      links,
      phone,
      email,
      is_public: false,
      images,
      audio_url: audioUrl,
      folder_id: selectedFolderId,
    };

    if (isGuestMode) {
      onCreateNote(noteData);
    } else {
      await createNote(noteData);
    }

    setTitle("");
    setContent("");
    setIsFormVisible(false);
  };

  const handleUpdateNote = async (images: string[], audioUrl: string | null) => {
    if (!editingNote) return;

    const { links, email, phone } = parseContent(content);

    const updatedNote = {
      ...editingNote,
      title: title.trim(),
      content: content.trim(),
      links,
      phone,
      email,
      images,
      audio_url: audioUrl,
      folder_id: editingNote.folder_id,
    };

    if (isGuestMode) {
      onUpdateNote(updatedNote);
    } else {
      await updateNote(updatedNote);
    }

    setEditingNote(null);
    setTitle("");
    setContent("");
    setIsFormVisible(false);
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
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || "");
    setIsFormVisible(true);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setIsFormVisible(false);
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
      {!isFormVisible ? (
        <Button 
          onClick={() => setIsFormVisible(true)}
          className="w-full"
        >
          <Plus className="mr-2" />
          {t('notes.create')}
        </Button>
      ) : (
        <NoteForm
          title={title}
          content={content}
          editingNote={editingNote}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onCancelEdit={handleCancelEdit}
          onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
        />
      )}

      <NoteListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={(value: "date" | "title") => setSortBy(value)}
      />

      <div className="space-y-4">
        {filteredAndSortedNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={handleEditNote}
            onDelete={isGuestMode ? onDeleteNote : deleteNote}
            onMove={(note) => {
              setSelectedNote(note);
              setIsMoveDialogOpen(true);
            }}
          />
        ))}
      </div>

      <NoteMoveDialog
        isOpen={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        selectedNote={selectedNote}
        onMoveNote={handleMoveNote}
      />
    </div>
  );
};