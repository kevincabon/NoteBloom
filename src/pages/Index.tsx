import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { Tag } from "@/types/tag";
import { useSharedNotes } from "@/hooks/useSharedNotes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { Header } from "@/components/notes/Header";
import { NotesContainer } from "@/components/notes/NotesContainer";
import { GuestModeToggle } from "@/components/GuestModeToggle";
import { FolderList } from "@/components/folders/FolderList";
import { Folder } from "@/types";
import { SearchBar } from "@/components/search/SearchBar"; // Correction du chemin d'importation
import { useMemo } from "react";

const Index = () => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]); // New state for selected tags
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [isSharedView, setIsSharedView] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isGuestMode, guestNotes, addGuestNote, updateGuestNote, deleteGuestNote } = useGuestMode();
  const queryClient = useQueryClient();

  // Récupérer les notes partagées
  const { data: sharedNotes = [] } = useSharedNotes();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', selectedFolderId],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return [];
        }

        let query = supabase
          .from("notes")
          .select(`
            *,
            tags:note_tags(
              tag_id,
              tags(*)
            )
          `)
          .eq('user_id', user.id)
          .order("created_at", { ascending: false });

        if (selectedFolderId) {
          query = query.eq('folder_id', selectedFolderId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform the nested tags structure
        const transformedData = data.map(note => ({
          ...note,
          tags: note.tags
            .map(t => t.tags)
            .filter(tag => tag !== null)
        }));

        return transformedData || [];
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les notes",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !isGuestMode,
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return [];
        }

        const { data, error } = await supabase
          .from("folders")
          .select("id, name, description, color, user_id, parent_id, created_at, updated_at")
          .eq('user_id', user.id)
          .order("created_at", { ascending: false })
          .returns<Folder[]>();

        if (error) throw error;
        return data || [];
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les dossiers",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !isGuestMode,
  });

  const filteredNotes = useMemo(() => {
    // Si on est en mode "Notes partagées", utiliser sharedNotes au lieu des notes normales
    let notesToFilter = isSharedView ? sharedNotes : (isGuestMode ? guestNotes : notes);

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      notesToFilter = notesToFilter.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      notesToFilter = notesToFilter.filter(note => {
        const noteTags = note.tags || [];
        return selectedTags.every(tag => 
          noteTags.some(noteTag => noteTag.id === tag.id)
        );
      });
    }

    // Filter by folder if not global search
    if (!isGlobalSearch && selectedFolderId) {
      notesToFilter = notesToFilter.filter(note => note.folder_id === selectedFolderId);
    }

    // Sort notes based on sortBy value
    return [...notesToFilter].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [notes, sharedNotes, guestNotes, searchQuery, selectedTags, isGlobalSearch, selectedFolderId, sortBy, isGuestMode, isSharedView]);

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
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      });
    }
  };

  const handleCreateFolder = async (data: { name: string; color?: string; parent_id?: string | null }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from("folders")
        .insert([
          {
            name: data.name,
            color: data.color,
            parent_id: data.parent_id,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Dossier créé avec succès",
      });

      // Invalider le cache pour recharger les dossiers
      queryClient.invalidateQueries(["folders"]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le dossier : " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateFolder = async (folderId: string, data: { name: string; color?: string; parent_id?: string | null }) => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({
          name: data.name,
          color: data.color,
          parent_id: data.parent_id
        })
        .eq("id", folderId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Dossier mis à jour avec succès",
      });

      // Invalider le cache pour recharger les dossiers
      queryClient.invalidateQueries(["folders"]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le dossier : " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Dossier supprimé avec succès",
      });

      // Invalider le cache pour recharger les dossiers
      queryClient.invalidateQueries(["folders"]);
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le dossier : " + error.message,
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
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_minmax(600px,_1fr)] gap-8">
          <aside className="space-y-4">
            <FolderList
              folders={isGuestMode ? [] : folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={(folderId) => {
                setSelectedFolderId(folderId);
                setIsSharedView(false);
              }}
              onCreateFolder={handleCreateFolder}
              onUpdateFolder={handleUpdateFolder}
              onDeleteFolder={handleDeleteFolder}
              onSelectSharedNotes={() => {
                setIsSharedView(true);
                setSelectedFolderId(null);
              }}
              isSharedNotesSelected={isSharedView}
            />
          </aside>
          <div className="flex-1 space-y-4">
            <NotesContainer
              notes={filteredNotes}
              selectedFolderId={selectedFolderId}
              onCreateNote={handleCreateNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              isGlobalSearch={isGlobalSearch}
              onGlobalSearchChange={setIsGlobalSearch}
              selectedTags={selectedTags}
              onSelectTag={(tag) => setSelectedTags([...selectedTags, tag])}
              onRemoveTag={(tagId) => setSelectedTags(selectedTags.filter(t => t.id !== tagId))}
              isSharedView={isSharedView}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
