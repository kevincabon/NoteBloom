import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

interface AudioRecorderProps {
  onAudioSaved: (url: string) => void;
}

export const AudioRecorder = ({ onAudioSaved }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: t('notes.errors.microphoneAccessDenied'),
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    try {
      setIsUploading(true);
      const filePath = `${crypto.randomUUID()}.webm`;

      const { error: uploadError } = await supabase.storage
        .from('notes-audio')
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('notes-audio')
        .getPublicUrl(filePath);

      onAudioSaved(publicUrl);
      toast({
        title: t('notes.audioRecorded'),
      });
    } catch (error) {
      toast({
        title: t('notes.errors.audioUploadFailed'),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={startRecording}
          disabled={isUploading}
        >
          <Mic className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={stopRecording}
          className="text-red-500"
        >
          <Square className="h-4 w-4" />
        </Button>
      )}
      {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  );
};