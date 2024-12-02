import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { Note } from "@/types/note";
import { NoteContent } from "@/components/notes/NoteContent";
import { NoteTimestamps } from "@/components/notes/NoteTimestamps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { t } from "@/lib/i18n";
import Link from "next/link";
import Avatar from "@/components/ui/avatar";
import AvatarImage from "@/components/ui/avatar/image";
import AvatarFallback from "@/components/ui/avatar/fallback";
import MarkdownPreview from "@/components/markdown/preview";

export const dynamic = 'force-dynamic';

export default async function SharedNotePage({
  params: { token },
}: {
  params: { token: string };
}) {
  const supabase = createServerComponentClient<Database>({ cookies });

  // Récupérer le lien de partage avec la note associée
  const { data: shareLink, error: shareLinkError } = await supabase
    .from("note_share_links")
    .select(`
      *,
      note:notes (
        id,
        title,
        content,
        created_at,
        updated_at,
        user:profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("token", token)
    .single();

  if (shareLinkError || !shareLink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">
            {t("shared.errors.notFound")}
          </h1>
          <p className="text-gray-600">
            {t("shared.errors.invalidOrExpired")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            {t("shared.backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  const { note } = shareLink;
  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">
            {t("shared.errors.noteDeleted")}
          </h1>
          <p className="text-gray-600">
            {t("shared.errors.noLongerAvailable")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            {t("shared.backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  // Vérifier si le lien a expiré
  const expiresAt = new Date(shareLink.expires_at);
  const now = new Date();
  if (expiresAt < now) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">
            {t("shared.errors.linkExpired")}
          </h1>
          <p className="text-gray-600">
            {t("shared.errors.expiredMessage")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            {t("shared.backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {note.user?.avatar_url && (
                <Avatar>
                  <AvatarImage src={note.user.avatar_url} />
                  <AvatarFallback>
                    {note.user.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h1 className="text-2xl font-bold">{note.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {t("shared.sharedBy", { name: note.user?.full_name })}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {t("shared.expiresAt", {
                date: new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(expiresAt),
              })}
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownPreview content={note.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
