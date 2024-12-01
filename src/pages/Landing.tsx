import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <ThemeToggle />
            </div>
            <Button onClick={() => navigate("/login")} variant="default">
              {t("auth.signIn")}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24">
        <div className="max-w-4xl mx-auto space-y-20">
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              {t("landing.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.subtitle")}
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/login")}>
                {t("landing.getStarted")}
              </Button>
            </div>
          </section>

          {/* Features Section */}
          <section className="space-y-12">
            <h2 className="text-3xl font-bold text-center">
              {t("landing.features.title")}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4 text-center">
                <h3 className="text-xl font-semibold">
                  {t("landing.features.notes.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.features.notes.description")}
                </p>
              </div>
              <div className="space-y-4 text-center">
                <h3 className="text-xl font-semibold">
                  {t("landing.features.folders.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.features.folders.description")}
                </p>
              </div>
              <div className="space-y-4 text-center">
                <h3 className="text-xl font-semibold">
                  {t("landing.features.organization.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.features.organization.description")}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Landing;