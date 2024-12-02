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
import { MessageSquareHeart, Sparkles } from "lucide-react";
import { FeedbackForm } from "../feedback/FeedbackForm";
import { Link } from "react-router-dom";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t">
      <div className="container flex h-16 items-center justify-between space-x-4 px-8 md:px-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Quick Note Garden</span>
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">Beta v0.1.0</span>
        </div>
        <nav className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Notes App
          </p>
          <div className="flex items-center gap-2">
            <Link to="/roadmap">
              <Button variant="ghost" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t("roadmap.title")}
              </Button>
            </Link>
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
        </nav>
      </div>
    </footer>
  );
};