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
import { useToast } from "@/components/ui/use-toast";

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
  const [localNotes, setLocalNotes] = useState<Note[]>(initialNotes);
  const { t } = useTranslation();
  const { isGuestMode } = useGuestMode();
  const { createNote, updateNote, deleteNote } = useNotes(initialNotes);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setLocalNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    const channel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNote = payload.new as Note;
            setLocalNotes(prev => [newNote, ...prev]);
            toast({
              title: t('notes.created'),
              description: t('notes.noteCreatedSuccess'),
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedNote = payload.new as Note;
            setLocalNotes(prev => prev.map(note => 
              note.id === updatedNote.id ? updatedNote : note
            ));
            toast({
              title: t('notes.updated'),
              description: t('notes.noteUpdatedSuccess'),
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedNote = payload.old as Note;
            setLocalNotes(prev => prev.filter(note => note.id !== deletedNote.id));
            toast({
              title: t('notes.deleted'),
              description: t('notes.noteDeletedSuccess'),
            });
          }
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, t]);

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
      const newNote = await createNote(noteData);
      if (newNote) {
        setLocalNotes(prev => [newNote, ...prev]);
      }
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
      setLocalNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
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
        setLocalNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
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
      setLocalNotes(prev => prev.filter(note => note.id !== id));
    }
  };

  const filteredAndSortedNotes = localNotes
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