import { Image, Link, Mail, Phone } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

interface NoteMetadataProps {
  links?: string[] | null;
  email?: string | null;
  phone?: string | null;
  images?: string[] | null;
  isSharedView?: boolean;
}

export const NoteMetadata = ({ 
  links, 
  email, 
  phone, 
  images,
  isSharedView = false 
}: NoteMetadataProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex gap-4 items-center text-sm text-muted-foreground">
      {images && images.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Image className="h-4 w-4" />
                <span>{images.length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('notes.images_count', { count: images.length })}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {links && links.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Link className="h-4 w-4" />
                <span>{links.length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <ul className="space-y-1">
                {links.map((link, index) => (
                  <li key={index}>
                    {!isSharedView ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {link}
                      </a>
                    ) : (
                      <span>{link}</span>
                    )}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {email && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {!isSharedView ? (
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              ) : (
                <span>{email}</span>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {phone && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {!isSharedView ? (
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              ) : (
                <span>{phone}</span>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};