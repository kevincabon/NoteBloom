import { ImagePreview } from "./ImagePreview";
import { useTranslation } from "react-i18next";

interface ImageListProps {
  title: string;
  images: string[];
  onRemove: (index: number) => void;
}

export const ImageList = ({ title, images, onRemove }: ImageListProps) => {
  const { t } = useTranslation();

  if (images.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <ImagePreview
            key={`${title}-${index}`}
            url={url}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>
    </div>
  );
};