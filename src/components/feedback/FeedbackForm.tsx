import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const feedbackSchema = z.object({
  type: z.enum(["suggestion", "bug", "question"]),
  content: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

export const FeedbackForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "suggestion",
      content: "",
    },
  });

  const onSubmit = async (data: FeedbackForm) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t("feedback.error"),
          description: t("feedback.notAuthenticated"),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("feedback").insert({
        type: data.type,
        content: data.content,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: t("feedback.success"),
        description: t("feedback.successDescription"),
      });

      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: t("feedback.error"),
        description: t("feedback.errorDescription"),
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("feedback.type")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("feedback.selectType")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="suggestion">
                    {t("feedback.types.suggestion")}
                  </SelectItem>
                  <SelectItem value="bug">
                    {t("feedback.types.bug")}
                  </SelectItem>
                  <SelectItem value="question">
                    {t("feedback.types.question")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("feedback.content")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("feedback.contentPlaceholder")}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {t("feedback.submit")}
        </Button>
      </form>
    </Form>
  );
};