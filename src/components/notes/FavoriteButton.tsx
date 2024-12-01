import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFavorites } from "@/hooks/useFavorites";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FavoriteButtonProps {
  noteId: string;
  className?: string;
}

export const FavoriteButton = ({ noteId, className }: FavoriteButtonProps) => {
  const { t } = useTranslation();
  const { addToFavorites, removeFromFavorites, isNoteFavorited } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const status = await isNoteFavorited(noteId);
      setIsFavorited(status);
    };
    checkFavoriteStatus();
  }, [noteId, isNoteFavorited]);

  const handleToggleFavorite = async () => {
    if (isFavorited) {
      await removeFromFavorites(noteId);
    } else {
      await addToFavorites(noteId);
    }
    setIsFavorited(!isFavorited);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite();
            }}
            className={className}
          >
            <Star
              className={`h-4 w-4 ${
                isFavorited ? "fill-yellow-400 text-yellow-400" : ""
              }`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isFavorited
            ? t("favorites.removeFromFavorites")
            : t("favorites.addToFavorites")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
