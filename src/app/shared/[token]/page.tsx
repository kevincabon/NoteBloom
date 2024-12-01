import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { Note } from "@/types/note";
import { NoteContent } from "@/components/notes/NoteContent";
import { NoteTimestamps } from "@/components/notes/NoteTimestamps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SharedNotePage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createServerComponentClient<Database>({ cookies });

  try {
    // Récupérer le lien de partage
    const { data: shareLink, error: shareLinkError } = await supabase
      .from("note_share_links")
      .select("*")
      .eq("token", params.token)
      .single();

    if (shareLinkError) {
      console.error("Error fetching share link:", shareLinkError);
      redirect("/404");
    }

    // Vérifier si le lien existe et n'est pas expiré
    if (
      !shareLink ||
      (shareLink.expires_at && new Date(shareLink.expires_at) < new Date())
    ) {
      redirect("/404");
    }

    // Récupérer la note avec les informations du dossier
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("*, folders(name, color)")
      .eq("id", shareLink.note_id)
      .single();

    if (noteError) {
      console.error("Error fetching note:", noteError);
      redirect("/404");
    }

    if (!note) {
      redirect("/404");
    }

    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>{note.title}</CardTitle>
            {note.folders && (
              <div className="mt-2">
                <span
                  className="inline-block px-2 py-1 rounded text-sm"
                  style={{ backgroundColor: note.folders.color + '40' }}
                >
                  {note.folders.name}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <NoteContent note={note as Note} readonly />
            <NoteTimestamps note={note as Note} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    redirect("/404");
  }
}
