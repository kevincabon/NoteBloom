import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { NoteContent } from "@/components/notes/NoteContent";
import { NoteTimestamps } from "@/components/notes/NoteTimestamps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Lock } from "lucide-react";

export default function SharedNote() {
  usePageTitle("notes.sharedNote");
  const { token } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchSharedNote() {
      if (!token) return;

      try {
        // First, find the note_id from the share link using a direct query
        const cleanToken = token.replace('eq.', '');
        
        const { data: shareLinks, error: shareError } = await supabase
          .rpc('get_share_link_by_token', {
            p_token: cleanToken
          });

        if (shareError) {
          console.error("Error fetching share link:", shareError);
          setError(t("sharedNote.errors.linkNotFound"));
          setLoading(false);
          return;
        }

        if (!shareLinks || shareLinks.length === 0) {
          setError(t("sharedNote.errors.linkNotFound"));
          setLoading(false);
          return;
        }

        const shareLink = shareLinks[0];

        // Check if the link has expired
        if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
          setError(t("sharedNote.errors.linkExpired"));
          setLoading(false);
          return;
        }

        // Then fetch the note details
        const { data: note, error: noteError } = await supabase
          .from("notes")
          .select("*, folders(name, color)")
          .eq("id", shareLink.note_id)
          .single();

        if (noteError) {
          console.error("Error fetching note:", noteError);
          setError(t("sharedNote.errors.fetchError"));
          setLoading(false);
          return;
        }

        if (!note) {
          setError(t("sharedNote.errors.noteNotFound"));
          setLoading(false);
          return;
        }

        setNote(note);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(t("sharedNote.errors.fetchError"));
      } finally {
        setLoading(false);
      }
    }

    fetchSharedNote();
  }, [token, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-lg w-full mx-4">
          <h1 className="text-xl font-semibold text-red-600 mb-2">{t("sharedNote.errors.error")}</h1>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{note.title}</h1>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              {!note.is_locked ? (
                <NoteContent 
                  content={note.content} 
                  audioUrl={note.audio_url}
                  images={note.images}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-8 px-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <Lock className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-center text-muted-foreground">
                    {t("notes.lock.status.sharedNoteLocked")}
                  </p>
                </div>
              )}
            </div>
            <NoteTimestamps 
              createdAt={note.created_at}
              updatedAt={note.updated_at}
            />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
