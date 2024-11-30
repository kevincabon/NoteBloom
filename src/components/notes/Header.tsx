import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  isEditing: boolean;
  onSave?: () => void;
  onLogout: () => void;
  children?: React.ReactNode;
}

export const Header = ({ isEditing, onSave, onLogout, children }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-4">
            {children}
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};