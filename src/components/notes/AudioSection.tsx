import { useTranslation } from "react-i18next";
import { AudioPlayer } from "./AudioPlayer";
import { AudioRecorder } from "./AudioRecorder";

interface AudioSectionProps {
  audioUrl: string | null;
  onNewAudio: (url: string) => void;
  onDeleteAudio: () => void;
}

export const AudioSection = ({ audioUrl, onNewAudio, onDeleteAudio }: AudioSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium">{t('notes.audioRecording')}</h3>
      {audioUrl ? (
        <AudioPlayer url={audioUrl} onDelete={onDeleteAudio} />
      ) : (
        <AudioRecorder onAudioSaved={onNewAudio} />
      )}
    </div>
  );
};