import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const UserOptions = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.options")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="emailNotifications">{t("profile.emailNotifications")}</Label>
          <Switch id="emailNotifications" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="publicProfile">{t("profile.publicProfile")}</Label>
          <Switch id="publicProfile" />
        </div>
      </CardContent>
    </Card>
  );
};