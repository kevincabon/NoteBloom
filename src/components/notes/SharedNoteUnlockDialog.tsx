import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface SharedNoteUnlockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: (password: string) => Promise<boolean>;
}

export const SharedNoteUnlockDialog = ({
  isOpen,
  onOpenChange,
  onUnlock,
}: SharedNoteUnlockDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    if (!password.trim()) return;

    try {
      setIsLoading(true);
      const success = await onUnlock(password);

      if (success) {
        setPassword("");
        onOpenChange(false);
      } else {
        toast({
          title: t("notes.sharing.errors.wrongPassword"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error unlocking shared note:", error);
      toast({
        title: t("notes.sharing.errors.unlockError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("notes.sharing.unlockTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder={t("notes.sharing.enterPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUnlock();
              }
            }}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleUnlock}
              disabled={isLoading || !password.trim()}
            >
              {t("notes.sharing.unlock")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
