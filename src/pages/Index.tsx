import { useState, useEffect } from "react";
import { Plus, Menu, Save, LogOut, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  links?: string[];
  phone?: string;
  email?: string;
}

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
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-sm z-50">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Notes</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={editingNote ? handleEditNote : handleCreateNote} 
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {editingNote ? "Modifier" : "Enregistrer"}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container pt-24 pb-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card className="p-6 space-y-4 animate-fade-in">
            <Input
              placeholder="Titre de la note"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
              maxLength={100}
            />
            <Textarea
              placeholder="Commencez à écrire..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none"
              maxLength={1000}
            />
            {editingNote && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setEditingNote(null);
                  setTitle("");
                  setContent("");
                }}
              >
                Annuler
              </Button>
            )}
          </Card>

          <div className="space-y-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="p-6 note-card cursor-pointer hover:shadow-md transition-all duration-300 fade-in"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">{note.title}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground line-clamp-3">
                  {note.content}
                </p>
                <time className="text-sm text-muted-foreground mt-4 block">
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(note.created_at))}
                </time>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;