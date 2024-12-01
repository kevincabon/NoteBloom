import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { MessageSquareHeart } from "lucide-react";
import { FeedbackForm } from "../feedback/FeedbackForm";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Notes App
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquareHeart className="h-4 w-4" />
                {t("feedback.giveFeedback")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("feedback.title")}</DialogTitle>
                <DialogDescription>
                  {t("feedback.description")}
                </DialogDescription>
              </DialogHeader>
              <FeedbackForm onSuccess={() => {}} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </footer>
  );
};