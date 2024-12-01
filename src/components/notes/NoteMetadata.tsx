import { Link, Mail, Phone } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteMetadataProps {
  links?: string[] | null;
  email?: string | null;
  phone?: string | null;
}

export const NoteMetadata = ({ links, email, phone }: NoteMetadataProps) => {
  return (
    <div className="flex gap-4 mt-4">
      {links && links.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer">
                <Link className="h-4 w-4" />
                {links.length}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <ul className="space-y-1">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {link}
                    </a>
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
              <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer">
                <Mail className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <a
                href={`mailto:${email}`}
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {email}
              </a>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {phone && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer">
                <Phone className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <a
                href={`tel:${phone}`}
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {phone}
              </a>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};