import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";

export const UserOptions = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.options")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>{t("common.theme")}</Label>
          <ThemeToggle />
        </div>
        <div className="space-y-2">
          <Label>{t("common.language")}</Label>
          <LanguageSelector />
        </div>
      </CardContent>
    </Card>
  );
};