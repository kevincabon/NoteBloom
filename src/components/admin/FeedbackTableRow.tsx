import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import type { Feedback } from "@/types/feedback";

interface FeedbackTableRowProps {
  feedback: Feedback;
  onStatusChange: (id: string, status: string) => void;
}

export const FeedbackTableRow = ({ feedback, onStatusChange }: FeedbackTableRowProps) => {
  const { t } = useTranslation();

  return (
    <TableRow>
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
          onValueChange={(value) => onStatusChange(feedback.id, value)}
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
  );
};