import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminStats } from "@/components/admin/AdminStats";
import { FeedbackManager } from "@/components/admin/FeedbackManager";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || !["admin", "superadmin"].includes(profile.role)) {
        toast({
          title: t("admin.unauthorized"),
          description: t("admin.unauthorizedDescription"),
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkAdminAccess();
  }, [navigate, toast, t]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{t("admin.dashboard")}</h1>
      <AdminStats />
      <FeedbackManager />
    </div>
  );
};

export default Admin;