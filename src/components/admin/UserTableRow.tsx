import { useTranslation } from "react-i18next";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types/user";
import { format } from "date-fns";

interface UserTableRowProps {
  user: User;
  onRoleChange: (userId: string, role: "user" | "admin" | "superadmin") => void;
}

export const UserTableRow = ({ user, onRoleChange }: UserTableRowProps) => {
  const { t } = useTranslation();

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm");
  };

  return (
    <TableRow>
      <TableCell>{user.username || "-"}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Select
          value={user.role}
          onValueChange={(value: "user" | "admin" | "superadmin") => onRoleChange(user.id, value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t("admin.selectRole")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">{t("admin.roles.user")}</SelectItem>
            <SelectItem value="admin">{t("admin.roles.admin")}</SelectItem>
            <SelectItem value="superadmin">{t("admin.roles.superadmin")}</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>{formatDate(user.created_at)}</TableCell>
      <TableCell>{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "-"}</TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
};
