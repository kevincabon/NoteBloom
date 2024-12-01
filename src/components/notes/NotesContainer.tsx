import { useState } from "react";
import { Note } from "@/types/note";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteCard } from "@/components/notes/NoteCard";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { useTranslation } from "react-i18next";
import { parseContent } from "@/utils/contentParser";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNotes } from "@/hooks/useNotes";

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
  const { t } = useTranslation();
  const { isGuestMode } = useGuestMode();
  const { createNote, updateNote, deleteNote } = useNotes(initialNotes);

  const { data: folders = [] } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleCreateNote = async (images: string[], audioUrl: string | null) => {
    if (!title.trim()) {
      return;
    }

    const { links, email, phone } = parseContent(content);
    
    console.log("Preparing to create note with audio:", audioUrl);

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
  };

  const handleMoveNote = async (note: Note, newFolderId: string | null) => {
    try {
      const { error } = await supabase
        .from("notes")
        .update({ folder_id: newFolderId })
        .eq("id", note.id);

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

  const filteredAndSortedNotes = notes
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
      <NoteForm
        title={title}
        content={content}
        editingNote={editingNote}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onCancelEdit={() => {
          setEditingNote(null);
          setTitle("");
          setContent("");
        }}
        onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
      />

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("notes.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: "date" | "title") => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("notes.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">{t("notes.sortByDate")}</SelectItem>
            <SelectItem value="title">{t("notes.sortByTitle")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredAndSortedNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={(note) => {
              setEditingNote(note);
              setTitle(note.title);
              setContent(note.content || "");
            }}
            onDelete={isGuestMode ? onDeleteNote : deleteNote}
            onMove={(note) => {
              setSelectedNote(note);
              setIsMoveDialogOpen(true);
            }}
          />
        ))}
      </div>

      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("notes.moveNote")}</DialogTitle>
            <DialogDescription>
              {t("notes.selectDestination")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => selectedNote && handleMoveNote(selectedNote, null)}
            >
              {t("notes.allNotes")}
            </Button>
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => selectedNote && handleMoveNote(selectedNote, folder.id)}
              >
                {folder.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};