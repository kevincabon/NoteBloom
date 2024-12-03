import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { 
  Notebook, 
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  Bot,
  Sparkles,
  LogIn,
  UserPlus,
  KeySquare
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [view, setView] = useState<"sign_in" | "sign_up" | "forgotten_password" | "update_password">("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  usePageTitle(
    view === "sign_in" 
      ? "auth.login.title" 
      : view === "sign_up" 
      ? "auth.register.title"
      : "auth.resetPassword.title"
  );

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "sign_up") {
        if (password !== passwordConfirm) {
          toast.error(t("auth.errors.passwordMismatch"));
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success(t("auth.register.success.title"), {
          description: t("auth.register.success.description"),
        });
        setView("sign_in");
      } else if (view === "forgotten_password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) throw error;

        toast.success(t("auth.resetPassword.success"));
        setView("sign_in");
      } else if (view === "update_password") {
        if (password !== passwordConfirm) {
          toast.error(t("auth.errors.passwordMismatch"));
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password,
        });

        if (error) throw error;

        toast.success(t("auth.updatePassword.success"));
        setView("sign_in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: import.meta.env.VITE_GUEST_EMAIL,
        password: import.meta.env.VITE_GUEST_PASSWORD,
      });

      if (error) {
        toast.error(t("auth.errors.guestLoginFailed"));
        console.error("Guest mode error:", error);
        return;
      }

      if (data?.user) {
        toast.success(t("auth.guestMode"));
        navigate("/");
      }
    } catch (error) {
      console.error("Guest mode error:", error);
      toast.error(t("auth.errors.guestLoginFailed"));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleView = () => {
    setView(view === "sign_in" ? "sign_up" : "sign_in");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
  };

  const getHeaderTitle = () => {
    switch (view) {
      case "sign_up":
        return t("auth.register.title");
      case "forgotten_password":
        return t("auth.resetPassword.title");
      case "update_password":
        return t("auth.resetPassword.title");
      default:
        return t("auth.login.title");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95 dark:from-background dark:via-background/95 dark:to-background/90" />
      
      {/* Accent Gradients */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10" />

      {/* Main Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8 text-center px-4 sm:px-0"
        >
          {/* Logo or App Name */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto w-full max-w-[200px]"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-xl">
                <Notebook className="size-8 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">
                NoteBloom
              </h1>
            </div>
          </motion.div>

          {/* Auth Card */}
          <Card className="border-none bg-card/50 shadow-xl backdrop-blur-xl">
            <CardHeader className="space-y-1 px-4 sm:px-6 pb-0">
              <div className="flex items-center justify-center gap-3">
                {view === "sign_in" && <LogIn className="size-6 text-primary" />}
                {view === "sign_up" && <UserPlus className="size-6 text-primary" />}
                {view === "forgotten_password" && <KeySquare className="size-6 text-primary" />}
                <h2 className="text-xl sm:text-2xl font-semibold">{getHeaderTitle()}</h2>
              </div>
              {view === "forgotten_password" && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t("auth.resetPassword.description")}
                </p>
              )}
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">
                    {t("auth.login.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.login.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 sm:h-11"
                  />
                </div>
                {view !== "forgotten_password" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm sm:text-base">
                      {t("auth.login.password")}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("auth.login.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>
                )}
                {(view === "sign_up" || view === "update_password") && (
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm" className="text-sm sm:text-base">
                      {t("auth.login.passwordConfirm")}
                    </Label>
                    <Input
                      id="passwordConfirm"
                      type="password"
                      placeholder={t("auth.login.passwordConfirm")}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                      {t("shared.loading")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {view === "sign_up" && <UserPlus className="size-4" />}
                      {view === "sign_in" && <LogIn className="size-4" />}
                      {view === "forgotten_password" && <KeySquare className="size-4" />}
                      {view === "sign_up" 
                        ? t("auth.register.submit") 
                        : view === "forgotten_password"
                        ? t("auth.resetPassword.submit")
                        : view === "update_password"
                        ? t("auth.updatePassword.submit")
                        : t("auth.login.submit")
                      }
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm sm:text-base space-y-2">
                {view !== "forgotten_password" && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={toggleView}
                    className="text-muted-foreground hover:text-primary text-sm sm:text-base"
                  >
                    {view === "sign_in" ? t("auth.login.noAccount") : t("auth.register.hasAccount")}
                  </Button>
                )}
                {view === "sign_in" && (
                  <div>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setView("forgotten_password")}
                      className="text-muted-foreground hover:text-primary text-sm sm:text-base"
                    >
                      {t("auth.login.forgotPassword")}
                    </Button>
                  </div>
                )}
                {view === "forgotten_password" && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setView("sign_in")}
                    className="text-muted-foreground hover:text-primary text-sm sm:text-base"
                  >
                    {t("auth.resetPassword.backToLogin")}
                  </Button>
                )}
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t dark:border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card/50 backdrop-blur-xl px-2 text-muted-foreground">
                    {t("auth.continueWith", { provider: "" })}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base bg-background/50 dark:bg-background/50 hover:bg-background/80 dark:hover:bg-background/80"
                >
                  <svg className="mr-2 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {t("auth.continueWith", { provider: "Google" })}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGuestMode}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base bg-background/50 dark:bg-background/50 hover:bg-background/80 dark:hover:bg-background/80"
                >
                  <Bot className="mr-2 size-4 sm:size-5" />
                  {t("auth.guestMode")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;