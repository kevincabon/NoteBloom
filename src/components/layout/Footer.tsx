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
import { MessageSquareHeart, Sparkles, Link2, Github } from "lucide-react";
import { FeedbackForm } from "../feedback/FeedbackForm";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { APP_VERSION } from "@/config/version";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

export const Footer = () => {
  const { t, i18n } = useTranslation("landing");
  const [dialogOpen, setDialogOpen] = useState(false);

  const formattedDate = new Date(APP_VERSION.lastUpdate).toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <footer className="w-full border-t">
      <div className="container flex h-16 items-center justify-between space-x-4 px-8 md:px-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">NoteBloom</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-default">
                  Beta v{APP_VERSION.number}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("landing.lastUpdate")}: {formattedDate}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Separator orientation="vertical" className="h-4" />
          <a
            href="https://lnkqr.co"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Link2 className="h-3 w-3" />
            LinkQR
          </a>
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