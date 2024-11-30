import { Menu, Save, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isEditing: boolean;
  onSave: () => void;
  onLogout: () => void;
}

export const Header = ({ isEditing, onSave, onLogout }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-sm z-50">
      <div className="container h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Notes</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onSave} className="gap-2">
            <Save className="h-4 w-4" />
            {isEditing ? "Modifier" : "Enregistrer"}
          </Button>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};