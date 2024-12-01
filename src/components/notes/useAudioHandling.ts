import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export const useAudioHandling = (initialAudioUrl: string | null) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDeleteAudio = async () => {
    if (audioUrl) {
      const audioPath = audioUrl.split('/').pop();
      if (audioPath) {
        const { error } = await supabase.storage
          .from('notes-audio')
          .remove([audioPath]);

        if (error) {
          toast({
            title: t('notes.errors.audioDeleteFailed'),
            variant: "destructive",
          });
          return;
        }
      }
    }
    setAudioUrl(null);
    toast({
      title: t('notes.audioDeleted'),
    });
  };

  const handleNewAudio = (url: string) => {
    if (audioUrl) {
      handleDeleteAudio();
    }
    setAudioUrl(url);
  };

  return {
    audioUrl,
    setAudioUrl,
    handleDeleteAudio,
    handleNewAudio,
  };
};