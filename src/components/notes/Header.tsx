import { Menu, Save, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";

interface HeaderProps {
  isEditing: boolean;
  onSave: () => void;
  onLogout: () => void;
  children?: React.ReactNode;
}

export const Header = ({ isEditing, onSave, onLogout, children }: HeaderProps) => {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-sm z-50">
      <div className="container h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('notes.title')}</h1>
        </div>
        <div className="flex items-center gap-4">
          {children}
          <LanguageSelector />
          <Button onClick={onSave} className="gap-2">
            <Save className="h-4 w-4" />
            {isEditing ? t('common.edit') : t('common.save')}
          </Button>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};