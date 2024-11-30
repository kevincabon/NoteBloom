import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  url: string;
  onRemove: () => void;
}

export const ImagePreview = ({ url, onRemove }: ImagePreviewProps) => {
  return (
    <div className="relative">
      <img
        src={url}
        alt=""
        className="w-24 h-24 object-cover rounded-md"
      />
      <Button
        onClick={onRemove}
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};