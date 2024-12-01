import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { FeedbackTable } from "./FeedbackTable";
import type { Feedback } from "@/types/feedback";

export const FeedbackManager = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: feedbacks, refetch } = useQuery({
    queryKey: ["admin-feedbacks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select(`
          *,
          profile:user_id(
            username
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our expected type
      return (data || []).map(item => ({
        ...item,
        profile: item.profile ? item.profile[0] : null
      })) as Feedback[];
    },
  });

  const updateFeedbackStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("feedback")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        title: t("admin.error"),
        description: t("admin.updateError"),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("admin.success"),
      description: t("admin.statusUpdated"),
    });
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.feedbackList")}</CardTitle>
      </CardHeader>
      <CardContent>
        <FeedbackTable
          feedbacks={feedbacks || []}
          onStatusChange={updateFeedbackStatus}
        />
      </CardContent>
    </Card>
  );
};