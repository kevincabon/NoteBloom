import { Button } from "@/components/ui/button";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { useTranslation } from "react-i18next";
import { LogIn, LogOut } from "lucide-react";

export const GuestModeToggle = () => {
  const { isGuestMode, setIsGuestMode } = useGuestMode();
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      onClick={() => setIsGuestMode(!isGuestMode)}
    >
      {isGuestMode ? (
        <>
          <LogIn className="h-4 w-4" />
          {t("auth.switchToAuth")}
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          {t("auth.switchToGuest")}
        </>
      )}
    </Button>
  );
};