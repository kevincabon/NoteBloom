import { Button } from "@/components/ui/button";
import { LogOut, User, ShieldCheck } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  isEditing: boolean;
  onSave?: () => void;
  onLogout: () => void;
  children?: React.ReactNode;
}

export const Header = ({ isEditing, onSave, onLogout, children }: HeaderProps) => {
  const { data: profile } = useQuery({
    queryKey: ["profile-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      return data;
    },
  });

  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";

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
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/admin">
                  <ShieldCheck className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};