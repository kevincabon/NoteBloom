import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { Header } from "@/components/notes/Header";
import { NotesContainer } from "@/components/notes/NotesContainer";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { GuestModeToggle } from "@/components/GuestModeToggle";
import { FolderList } from "@/components/folders/FolderList";

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isGuestMode, guestNotes, addGuestNote, updateGuestNote, deleteGuestNote } = useGuestMode();

  useEffect(() => {
    if (!isGuestMode) {
      fetchNotes();
    }
  }, [isGuestMode, selectedFolderId]);

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      let query = supabase
        .from("notes")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (selectedFolderId) {
        query = query.eq('folder_id', selectedFolderId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (note: Omit<Note, "id" | "created_at" | "updated_at">) => {
    if (isGuestMode) {
      addGuestNote(note);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .insert([{ ...note, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setNotes([data, ...notes]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la note",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNote = async (note: Note) => {
    if (isGuestMode) {
      updateGuestNote(note);
      return;
    }

    try {
      const { error } = await supabase
        .from("notes")
        .update(note)
        .eq('id', note.id);

      if (error) throw error;

      setNotes(notes.map(n => n.id === note.id ? note : n));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (isGuestMode) {
      deleteGuestNote(noteId);
      return;
    }

    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isEditing={false}
        onSave={() => {}}
        onLogout={handleLogout}
      >
        <GuestModeToggle />
      </Header>

      <main className="container pt-24 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          <aside className="space-y-4">
            <FolderList onSelectFolder={setSelectedFolderId} />
          </aside>
          <NotesContainer
            notes={isGuestMode ? guestNotes : notes}
            selectedFolderId={selectedFolderId}
            onCreateNote={handleCreateNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;