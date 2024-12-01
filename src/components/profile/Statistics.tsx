import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const Statistics = () => {
  const { t } = useTranslation();
  
  const { data: stats } = useQuery({
    queryKey: ["notes-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: notes, error: notesError } = await supabase
        .from("notes")
        .select("created_at")
        .eq("user_id", user.id);

      if (notesError) throw notesError;

      const { data: folders, error: foldersError } = await supabase
        .from("folders")
        .select("id")
        .eq("user_id", user.id)
        .returns<Array<{ id: string }>>();

      if (foldersError) throw foldersError;

      // Group notes by month
      const notesByMonth = notes?.reduce((acc: Record<string, number>, note) => {
        const month = new Date(note.created_at).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(notesByMonth || {}).map(([month, count]) => ({
        month,
        notes: count,
      }));

      return {
        totalNotes: notes?.length || 0,
        totalFolders: folders?.length || 0,
        chartData,
      };
    },
  });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t("profile.statistics")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">{t("profile.totalNotes")}</p>
            <p className="text-2xl font-bold">{stats?.totalNotes}</p>
          </div>
          <div>
            <p className="text-sm font-medium">{t("profile.totalFolders")}</p>
            <p className="text-2xl font-bold">{stats?.totalFolders}</p>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.chartData || []}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="notes" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};