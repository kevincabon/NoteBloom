import { Button } from "@/components/ui/button";
import { Play, Pause, X } from "lucide-react";
import { useState, useRef } from "react";

interface AudioPlayerProps {
  url: string;
  onDelete?: () => void;
}

export const AudioPlayer = ({ url, onDelete }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={togglePlayback}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      {onDelete && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};