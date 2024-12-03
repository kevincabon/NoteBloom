import { MessageSquareHeart, Sparkles, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { APP_VERSION } from "@/config/version";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "../feedback/FeedbackForm";

export const Footer = () => {
  const { t, i18n } = useTranslation("landing");
  const [dialogOpen, setDialogOpen] = useState(false);

  const formattedDate = new Date(APP_VERSION.lastUpdate).toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col sm:flex-row h-auto sm:h-16 py-4 sm:py-0 items-center justify-between gap-4 sm:gap-0 px-4 sm:px-8">
        {/* Left section */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
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
          <div className="hidden sm:flex">
            <Separator orientation="vertical" className="h-4" />
          </div>
          <a
            href="https://lnkqr.co"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Link2 className="h-3 w-3" />
            LinkQR
          </a>
        </div>

        {/* Right section */}
        <nav className="flex items-center gap-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-primary"
              >
                <MessageSquareHeart className="h-4 w-4" />
                <span className="hidden sm:inline">{t("feedback.title")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <FeedbackForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <Link
            to="/roadmap"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{t("viewRoadmap")}</span>
          </Link>
        </nav>
      </div>
    </footer>
  );
};