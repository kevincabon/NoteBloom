import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Profile = {
  username: string | null;
};

type Feedback = {
  id: string;
  type: string;
  content: string;
  status: string;
  created_at: string;
  user_id: string;
  profile: Profile | null;
};

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
          profile:profiles!user_id(username)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Feedback[];
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.user")}</TableHead>
              <TableHead>{t("admin.type")}</TableHead>
              <TableHead>{t("admin.content")}</TableHead>
              <TableHead>{t("admin.status")}</TableHead>
              <TableHead>{t("admin.date")}</TableHead>
              <TableHead>{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks?.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>{feedback.profile?.username || t("admin.unknownUser")}</TableCell>
                <TableCell>
                  <Badge variant="outline">{feedback.type}</Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {feedback.content}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      feedback.status === "pending"
                        ? "secondary"
                        : feedback.status === "in_progress"
                        ? "default"
                        : "outline"
                    }
                  >
                    {feedback.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(feedback.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Select
                    value={feedback.status}
                    onValueChange={(value) => updateFeedbackStatus(feedback.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t("admin.pending")}</SelectItem>
                      <SelectItem value="in_progress">{t("admin.inProgress")}</SelectItem>
                      <SelectItem value="resolved">{t("admin.resolved")}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};