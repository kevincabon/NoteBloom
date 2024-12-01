import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FeedbackTableRow } from "./FeedbackTableRow";
import type { Feedback } from "@/types/feedback";

interface FeedbackTableProps {
  feedbacks: Feedback[];
  onStatusChange: (id: string, status: string) => void;
}

export const FeedbackTable = ({ feedbacks, onStatusChange }: FeedbackTableProps) => {
  const { t } = useTranslation();

  return (
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
          <FeedbackTableRow
            key={feedback.id}
            feedback={feedback}
            onStatusChange={onStatusChange}
          />
        ))}
      </TableBody>
    </Table>
  );
};