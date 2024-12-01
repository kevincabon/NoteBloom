import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Image } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <Dialog key={index}>
            <DialogTrigger>
              <img
                src={image}
                alt=""
                className="w-20 h-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
              />
            </DialogTrigger>
            <DialogContent className="max-w-3xl z-[9999]">
              <img
                src={image}
                alt=""
                className="w-full h-auto"
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="mt-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Image className="h-4 w-4" />
              {images.length}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {images.length} image(s)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};