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

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [view, setView] = useState<"sign_in" | "sign_up" | "forgotten_password" | "update_password">("sign_in");

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

  const socialProviderText = (provider: string) => {
    return t("auth.continueWith", { provider });
  };

  const toggleView = () => {
    setView(view === "sign_in" ? "sign_up" : "sign_in");
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
          className="w-full max-w-md space-y-8 text-center"
        >
          {/* Logo or App Name */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto w-fit"
          >
            <div className="relative h-12 w-12 rounded-lg bg-primary/10 p-2">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-primary-foreground opacity-20 blur" />
              <div className="relative flex h-full items-center justify-center text-2xl font-bold text-primary">
                NB
              </div>
            </div>
          </motion.div>

          {/* Title and Subtitle */}
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
            >
              {getHeaderTitle()}
            </motion.h1>
            {view === "forgotten_password" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                {t("auth.resetPassword.description")}
              </motion.p>
            )}
          </div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="overflow-hidden border-border/40 bg-card/60 backdrop-blur-xl dark:border-border/40 dark:bg-card/40">
              <CardHeader className="border-b border-border/40 bg-muted/40 px-6 dark:border-border/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {getHeaderTitle()}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGuestMode}
                    className={cn(
                      "text-sm text-muted-foreground hover:text-foreground",
                      "dark:text-muted-foreground dark:hover:text-foreground"
                    )}
                  >
                    {t("auth.switchToGuest")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Auth
                  supabaseClient={supabase}
                  view={view}
                  showLinks={false}
                  appearance={{
                    theme: ThemeSupa,
                    extend: true,
                    variables: {
                      default: {
                        colors: {
                          brand: 'hsl(var(--primary))',
                          brandAccent: 'hsl(var(--primary))',
                          inputBackground: 'transparent',
                          inputBorder: 'hsl(var(--border))',
                          inputText: 'hsl(var(--foreground))',
                          inputPlaceholder: 'hsl(var(--muted-foreground))',
                          inputLabelText: 'hsl(var(--muted-foreground))',
                        },
                        borderWidths: {
                          buttonBorderWidth: '1px',
                          inputBorderWidth: '1px',
                        },
                        borderRadii: {
                          borderRadiusButton: '0.75rem',
                          buttonBorderRadius: '0.75rem',
                          inputBorderRadius: '0.75rem',
                        },
                        space: {
                          inputPadding: '1rem',
                          buttonPadding: '1rem',
                          spaceSmall: '0.75rem',
                          spaceMedium: '1rem',
                          spaceLarge: '1.25rem',
                        },
                        fonts: {
                          bodyFontFamily: `"Inter", system-ui, -apple-system, sans-serif`,
                          buttonFontFamily: `"Inter", system-ui, -apple-system, sans-serif`,
                          inputFontFamily: `"Inter", system-ui, -apple-system, sans-serif`,
                          labelFontFamily: `"Inter", system-ui, -apple-system, sans-serif`,
                        },
                      },
                    },
                    className: {
                      button: cn(
                        'bg-primary font-medium shadow-sm transition-colors hover:bg-primary/90 text-primary-foreground',
                        'dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground'
                      ),
                      container: 'space-y-4',
                      divider: cn(
                        'bg-border/60 dark:bg-border/60'
                      ),
                      label: cn(
                        'text-sm font-medium text-muted-foreground',
                        'dark:text-muted-foreground'
                      ),
                      input: cn(
                        'bg-background/60 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors',
                        'dark:bg-background/60 dark:border-border dark:focus-visible:ring-primary dark:focus-visible:border-primary'
                      ),
                      loader: 'border-muted-foreground border-t-primary',
                      message: cn(
                        'text-sm text-foreground/80',
                        'dark:text-foreground/80'
                      ),
                      anchor: cn(
                        'text-sm font-medium text-primary hover:text-primary/80 transition-colors',
                        'dark:text-primary dark:hover:text-primary/80'
                      ),
                    },
                  }}
                  providers={["google"]}
                  localization={{
                    variables: {
                      sign_in: {
                        email_label: t("auth.login.email"),
                        password_label: t("auth.login.password"),
                        button_label: t("auth.login.submit"),
                        loading_button_label: "...",
                        social_provider_text: socialProviderText("{{provider}}"),
                        forgot_password_label: t("auth.login.forgotPassword"),
                        email_input_placeholder: t("auth.login.emailPlaceholder"),
                        password_input_placeholder: t("auth.login.passwordPlaceholder")
                      },
                      sign_up: {
                        email_label: t("auth.register.email"),
                        password_label: t("auth.register.password"),
                        button_label: t("auth.register.submit"),
                        loading_button_label: "...",
                        social_provider_text: socialProviderText("{{provider}}"),
                        email_input_placeholder: t("auth.register.emailPlaceholder"),
                        password_input_placeholder: t("auth.register.passwordPlaceholder"),
                        confirm_password_label: t("auth.register.confirmPassword"),
                        confirm_password_input_placeholder: t("auth.register.confirmPasswordPlaceholder")
                      },
                      forgotten_password: {
                        email_label: t("auth.login.email"),
                        button_label: t("auth.resetPassword.submit"),
                        loading_button_label: "...",
                        link_text: "",
                        confirmation_text: t("auth.resetPassword.success"),
                        email_input_placeholder: t("auth.login.emailPlaceholder")
                      },
                      update_password: {
                        password_label: t("auth.resetPassword.newPassword"),
                        button_label: t("auth.resetPassword.updatePassword"),
                        loading_button_label: "...",
                        confirmation_text: t("auth.resetPassword.success"),
                        password_input_placeholder: t("auth.login.passwordPlaceholder")
                      }
                    },
                    translations: {
                      fr: {
                        "Invalid login credentials": t("auth.errors.invalidCredentials")
                      },
                      en: {
                        "Invalid login credentials": t("auth.errors.invalidCredentials")
                      },
                      es: {
                        "Invalid login credentials": t("auth.errors.invalidCredentials")
                      }
                    }
                  }}
                />
                {view !== "forgotten_password" && view !== "update_password" && (
                  <div className="mt-4 text-center text-sm space-y-2">
                    <div>
                      <span className="text-muted-foreground">
                        {view === "sign_in" ? t("auth.login.noAccount") : t("auth.register.haveAccount")}{" "}
                      </span>
                      <button
                        onClick={toggleView}
                        className={cn(
                          "font-medium transition-colors",
                          "text-primary hover:text-primary/80",
                          "dark:text-primary dark:hover:text-primary/80"
                        )}
                      >
                        {view === "sign_in" ? t("auth.login.signUp") : t("auth.register.signIn")}
                      </button>
                    </div>
                    {view === "sign_in" && (
                      <div>
                        <button
                          onClick={() => setView("forgotten_password")}
                          className={cn(
                            "font-medium transition-colors",
                            "text-primary hover:text-primary/80",
                            "dark:text-primary dark:hover:text-primary/80"
                          )}
                        >
                          {t("auth.login.forgotPassword")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {view === "forgotten_password" && (
                  <div className="mt-4 text-center text-sm">
                    <button
                      onClick={() => setView("sign_in")}
                      className={cn(
                        "font-medium transition-colors",
                        "text-primary hover:text-primary/80",
                        "dark:text-primary dark:hover:text-primary/80"
                      )}
                    >
                      {t("auth.resetPassword.backToLogin")}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;