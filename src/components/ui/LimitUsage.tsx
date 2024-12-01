import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LimitUsageProps {
  current: number;
  max: number | null;
  className?: string;
  type?: "rootFolders" | "subFolders";
}

export const LimitUsage = ({ current, max, className, type = "rootFolders" }: LimitUsageProps) => {
  const { t } = useTranslation();

  if (!max) return null;

  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = percentage >= 80;

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn(
        "text-sm",
        isNearLimit ? "text-warning" : "text-muted-foreground"
      )}>
        {t("limits.currentUsage", { 
          current, 
          max, 
          type: t(`limits.types.${type}`)
        })}
      </div>
      <Progress 
        value={percentage} 
        className="h-2 bg-secondary"
        indicatorClassName={cn(
          "transition-all duration-300",
          isNearLimit ? "bg-warning" : "bg-primary"
        )}
      />
    </div>
  );
};
