import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Note } from '@/types/notes';
import { NoteContent } from '@/components/notes/NoteContent';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Lock } from '@/components/icons/Lock';

export default function SharedNote() {
  const router = useRouter();
  const { token } = router.query;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchSharedNote() {
      if (!token) return;

      try {
        // First, find the note_id from the share link
        const { data: shareLinks, error: shareError } = await supabase
          .from('note_share_links')
          .select('note_id')
          .eq('token', token)
          .single();

        if (shareError) throw shareError;
        if (!shareLinks) {
          setError(t('errors.linkNotFound'));
          setLoading(false);
          return;
        }

        // Then fetch the note details
        const { data: note, error: noteError } = await supabase
          .from('notes')
          .select('*, folders(name, color)')
          .eq('id', shareLinks.note_id)
          .single();

        if (noteError) throw noteError;
        if (!note) {
          setError(t('errors.noteNotFound'));
          setLoading(false);
          return;
        }

        setNote(note);
      } catch (err) {
        console.error('Error fetching shared note:', err);
        setError(t('errors.fetchError'));
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
          <h1 className="text-xl font-semibold text-red-600 mb-2">{t('errors.error')}</h1>
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
      <Card className="p-6">
        <div className="mb-4">
          {note.folders && (
            <span
              className="inline-block px-2 py-1 rounded text-sm mr-2"
              style={{ backgroundColor: note.folders.color + '40' }}
            >
              {note.folders.name}
            </span>
          )}
        </div>
        {!note.is_locked ? (
          <NoteContent note={note} readonly />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-8 px-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
            <Lock className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-center text-muted-foreground">
              {t("notes.lock.status.locked")}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
