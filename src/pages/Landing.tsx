import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { Notebook, FolderKanban, Search, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
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
        <div className="max-w-4xl mx-auto space-y-32">
          {/* Hero Section */}
          <section className="text-center space-y-8">
            <div className="inline-block animate-fade-in">
              <div className="size-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-950 flex items-center justify-center">
                <Notebook className="size-12 text-purple-500 dark:text-purple-300" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 animate-fade-in">
              {t("landing.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              {t("landing.subtitle")}
            </p>
            <div className="flex gap-4 justify-center animate-fade-in">
              <Button 
                size="lg" 
                onClick={() => navigate("/login")}
                className="group"
              >
                {t("landing.getStarted")}
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </section>

          {/* Features Section */}
          <section className="space-y-16 animate-fade-in">
            <h2 className="text-3xl font-bold text-center">
              {t("landing.features.title")}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 hover:scale-105 transition-transform duration-300">
                <div className="size-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <Notebook className="size-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold">
                  {t("landing.features.notes.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.features.notes.description")}
                </p>
              </div>
              <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 hover:scale-105 transition-transform duration-300">
                <div className="size-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <FolderKanban className="size-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold">
                  {t("landing.features.folders.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing.features.folders.description")}
                </p>
              </div>
              <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-950 dark:to-orange-950 hover:scale-105 transition-transform duration-300">
                <div className="size-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <Search className="size-6 text-pink-500" />
                </div>
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