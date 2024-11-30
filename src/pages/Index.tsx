import { useState } from "react";
import { Plus, Menu, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  links?: string[];
  phone?: string;
  email?: string;
}

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleCreateNote = () => {
    if (!title.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez entrer un titre pour votre note",
        variant: "destructive",
      });
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date(),
    };

    setNotes([newNote, ...notes]);
    setTitle("");
    setContent("");

    toast({
      title: "Note créée",
      description: "Votre note a été enregistrée avec succès",
    });
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
            <Button onClick={handleCreateNote} className="gap-2">
              <Save className="h-4 w-4" />
              Enregistrer
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
          </Card>

          <div className="space-y-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="p-6 note-card cursor-pointer hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium mb-2">{note.title}</h3>
                <p className="text-muted-foreground line-clamp-3">
                  {note.content}
                </p>
                <time className="text-sm text-muted-foreground mt-4 block">
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(note.createdAt)}
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