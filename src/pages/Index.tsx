import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { Header } from "@/components/notes/Header";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteCard } from "@/components/notes/NoteCard";

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

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

  const handleCreateNote = async () => {
    if (!title.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez entrer un titre pour votre note",
        variant: "destructive",
      });
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
        .insert([
          {
            title: title.trim(),
            content: content.trim() || null,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setTitle("");
      setContent("");

      toast({
        title: "Note créée",
        description: "Votre note a été enregistrée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
      toast({
        title: "Note supprimée",
        description: "La note a été supprimée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      });
    }
  };

  const handleEditNote = async () => {
    if (!editingNote) return;

    try {
      const { error } = await supabase
        .from("notes")
        .update({
          title: title.trim(),
          content: content.trim() || null,
        })
        .eq('id', editingNote.id);

      if (error) throw error;

      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, title: title.trim(), content: content.trim() || null }
          : note
      ));

      setEditingNote(null);
      setTitle("");
      setContent("");

      toast({
        title: "Note modifiée",
        description: "La note a été mise à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la note",
        variant: "destructive",
      });
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || "");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isEditing={!!editingNote}
        onSave={editingNote ? handleEditNote : handleCreateNote}
        onLogout={handleLogout}
      />

      <main className="container pt-24 pb-16">
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
          />

          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={startEditing}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
