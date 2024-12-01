import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";

const getLocale = (language: string) => {
  switch (language) {
    case "fr":
      return fr;
    case "es":
      return es;
    default:
      return enUS;
  }
};

export const RecentActivity = () => {
  const { t, i18n } = useTranslation();
  
  const { data: recentNotes } = useQuery({
    queryKey: ["recent-notes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.recentActivity")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {recentNotes?.map((note) => (
            <div key={note.id} className="mb-4 last:mb-0">
              <h4 className="font-medium">{note.title}</h4>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(note.updated_at), {
                  addSuffix: true,
                  locale: getLocale(i18n.language),
                })}
              </p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};