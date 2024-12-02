import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { NoteContent } from "@/components/notes/NoteContent";
import { NoteTimestamps } from "@/components/notes/NoteTimestamps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Lock } from "lucide-react";
import { SharedNoteUnlockDialog } from "@/components/notes/SharedNoteUnlockDialog";

export default function SharedNote() {
  usePageTitle("notes.sharedNote");
  const { token } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const { t } = useTranslation();

  const handleUnlock = async (password: string) => {
    if (!token) return false;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data: result, error } = await supabase
        .rpc('verify_share_link_password', {
          p_token: token,
          p_password_hash: passwordHash
        });

      if (error) {
        console.error("Error verifying password:", error);
        return false;
      }

      if (result && result.length > 0) {
        await fetchNoteContent(result[0].note_id);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error unlocking note:", error);
      return false;
    }
  };

  const fetchNoteContent = async (noteId: string) => {
    try {
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (noteError) throw noteError;

      if (note) {
        setNote(note);
        setIsLocked(false);
      }
    } catch (error) {
      console.error("Error fetching note:", error);
      setError(t("sharedNote.errors.noteNotFound"));
    }
  };

  useEffect(() => {
    async function fetchSharedNote() {
      if (!token) return;

      try {
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

        // If the note has a password, show the unlock dialog
        if (shareLink.password_hash) {
          setIsLocked(true);
          setShowUnlockDialog(true);
          setLoading(false);
          return;
        }

        // If no password, fetch the note content directly
        await fetchNoteContent(shareLink.note_id);
      } catch (error) {
        console.error("Error:", error);
        setError(t("sharedNote.errors.generic"));
      } finally {
        setLoading(false);
      }
    }

    fetchSharedNote();
  }, [token, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">{t("sharedNote.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Lock className="h-12 w-12 mx-auto mb-4" />
            <p>{t("sharedNote.passwordProtected")}</p>
            <Button
              onClick={() => setShowUnlockDialog(true)}
              className="mt-4"
            >
              {t("sharedNote.unlock")}
            </Button>
          </div>
        </div>
        <SharedNoteUnlockDialog
          isOpen={showUnlockDialog}
          onOpenChange={setShowUnlockDialog}
          onUnlock={handleUnlock}
        />
      </>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>{t("sharedNote.errors.noteNotFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteContent note={note} readonly />
          <div className="mt-4 pt-4 border-t">
            <NoteTimestamps
              createdAt={note.created_at}
              updatedAt={note.updated_at}
              owner={note.owner}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
