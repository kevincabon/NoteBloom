import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { RecentActivity } from "@/components/profile/RecentActivity";
import { Statistics } from "@/components/profile/Statistics";
import { UserOptions } from "@/components/profile/UserOptions";
import { usePageTitle } from "@/hooks/usePageTitle";

const Profile = () => {
  usePageTitle("profile.title");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setUsername(data.username || "");
      return { ...data, email: user.email };
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: t("profile.updated"),
      });

      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: t("profile.errors.updateFailed"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {t("common.backToHome")}
          </Link>
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          {t("common.logout")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6" />
              {t("profile.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.email")}</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">{t("profile.username")}</Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("profile.usernamePlaceholder")}
                  />
                  <Button onClick={handleUpdateProfile}>
                    {t("common.save")}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {t("common.cancel")}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <Input
                    id="username"
                    value={profile?.username || ""}
                    disabled
                    className="bg-muted"
                  />
                  <Button variant="outline" onClick={() => {
                    setUsername(profile?.username || "");
                    setIsEditing(true);
                  }}>
                    {t("common.edit")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Statistics />
        <RecentActivity />
        <UserOptions />
      </div>
    </div>
  );
};

export default Profile;