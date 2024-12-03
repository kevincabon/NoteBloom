import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  Lock, 
  Sparkles, 
  CheckSquare, 
  Smile, 
  Star, 
  Wand2, 
  MessageSquareHeart,
  Users,
  Layout,
  Calendar,
  MessagesSquare,
  FileText,
  Bot,
  Tags,
  Database,
  Upload,
  Download,
  Shield,
  Smartphone,
  Moon,
  Palette,
  Tablet
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

const Roadmap = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle("roadmap.title");

  const features = [
    {
      category: "roadmap.editor",
      items: [
        { key: "autocomplete", icon: <Wand2 className="w-4 h-4" />, status: "done" },
        { key: "checkboxes", icon: <CheckSquare className="w-4 h-4" />, status: "done" },
        { key: "emojis", icon: <Smile className="w-4 h-4" />, status: "planned" },
        { key: "favorites", icon: <Star className="w-4 h-4" />, status: "planned" },
        { key: "templates", icon: <FileText className="w-4 h-4" />, status: "soon" },
        { key: "ai", icon: <Bot className="w-4 h-4" />, status: "planned" }
      ],
    },
    {
      category: "roadmap.interface",
      items: [
        { key: "responsiveDesign", icon: <Smartphone className="w-4 h-4" />, status: "inDev" },
        { key: "darkMode", icon: <Moon className="w-4 h-4" />, status: "inDev" },
        { key: "customThemes", icon: <Palette className="w-4 h-4" />, status: "planned" },
        { key: "gestureSupport", icon: <Tablet className="w-4 h-4" />, status: "planned" }
      ],
    },
    {
      category: "roadmap.security",
      items: [
        { key: "encryption", icon: <Shield className="w-4 h-4" />, status: "done" },
        { key: "twoFactor", icon: <Lock className="w-4 h-4" />, status: "planned" },
        { key: "noteLock", icon: <Lock className="w-4 h-4" />, status: "done" },
        { key: "backup", icon: <Database className="w-4 h-4" />, status: "soon" }
      ],
    },
    {
      category: "roadmap.collaboration",
      items: [
        { key: "realTimeCollab", icon: <Users className="w-4 h-4" />, status: "inDev" },
        { key: "comments", icon: <MessagesSquare className="w-4 h-4" />, status: "planned" },
        { key: "sharing", icon: <Users className="w-4 h-4" />, status: "done" }
      ],
    },
    {
      category: "roadmap.organization",
      items: [
        { key: "tags", icon: <Tags className="w-4 h-4" />, status: "done" },
        { key: "customFields", icon: <Database className="w-4 h-4" />, status: "planned" },
        { key: "kanban", icon: <Layout className="w-4 h-4" />, status: "planned" },
        { key: "calendar", icon: <Calendar className="w-4 h-4" />, status: "planned" },
        { key: "import", icon: <Upload className="w-4 h-4" />, status: "soon" },
        { key: "export", icon: <Download className="w-4 h-4" />, status: "soon" }
      ],
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">{t("roadmap.status.done")}</Badge>;
      case "inDev":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">{t("roadmap.status.inDev")}</Badge>;
      case "soon":
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">{t("roadmap.status.soon")}</Badge>;
      case "planned":
        return <Badge variant="outline" className="border-purple-500/20 text-purple-500">{t("roadmap.status.planned")}</Badge>;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "roadmap.editor":
        return "blue";
      case "roadmap.security":
        return "red";
      case "roadmap.collaboration":
        return "green";
      case "roadmap.organization":
        return "purple";
      case "roadmap.interface":
        return "orange";
      default:
        return "blue";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            {t("roadmap.title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {t("roadmap.description")}
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/")} size="sm" className="border border-border">
          <Home className="w-4 h-4 mr-2" />
          {t("common.backToHome")}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          {features.map((category) => (
            <Card 
              key={category.category} 
              className={`border-t-4 border-t-${getCategoryColor(category.category)}-500/50 shadow-md shadow-${getCategoryColor(category.category)}-500/5`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className={`text-${getCategoryColor(category.category)}-500`}>
                    {category.category === "roadmap.editor" ? <Wand2 className="w-5 h-5" /> :
                     category.category === "roadmap.security" ? <Shield className="w-5 h-5" /> :
                     category.category === "roadmap.collaboration" ? <Users className="w-5 h-5" /> :
                     category.category === "roadmap.interface" ? <Smartphone className="w-5 h-5" /> :
                     <Layout className="w-5 h-5" />}
                  </div>
                  {t(category.category)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {category.items.map((item) => (
                    <div
                      key={item.key}
                      className="flex flex-col space-y-3 p-4 rounded-lg border border-border/50 bg-gradient-to-r from-transparent to-blue-500/5 hover:to-blue-500/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-blue-500/10">
                            {item.icon}
                          </div>
                          <span className="font-medium">{t(`roadmap.features.${item.key}`)}</span>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground pl-11">
                        {t(`roadmap.features.${item.key}Desc`)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-t-4 border-t-purple-500/50 shadow-md shadow-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-purple-500" />
                {t("roadmap.suggestions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t("roadmap.suggestionsDescription")}
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <MessageSquareHeart className="w-4 h-4" />
                    {t("feedback.giveFeedback")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("feedback.title")}</DialogTitle>
                    <DialogDescription>
                      {t("feedback.description")}
                    </DialogDescription>
                  </DialogHeader>
                  <FeedbackForm onSuccess={() => {}} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Roadmap;
