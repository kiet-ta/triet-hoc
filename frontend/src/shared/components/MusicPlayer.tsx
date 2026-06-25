import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAudioStore } from "../stores/audioStore";

export function MusicPlayer() {
  const { isPlaying, volume, togglePlay } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        // Handle play promise to avoid uncaught errors if browser blocks autoplay
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn("Autoplay prevented or audio loading failed:", error);
            // If browser blocked it, we might want to sync state back to false,
            // but usually we just let the user click again.
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume]);

  return (
    <>
      <audio
        ref={audioRef}
        src="https://upload.wikimedia.org/wikipedia/commons/4/44/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg"
        loop
        preload="auto"
      />
      
      <button
        onClick={togglePlay}
        className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 dark:bg-slate-800/40 dark:hover:bg-slate-700/60"
        aria-label={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
        title={isPlaying ? "Tắt nhạc nền (Minecraft style)" : "Bật nhạc nền thư giãn"}
      >
        {isPlaying ? (
          <Volume2 className="h-6 w-6 text-ink dark:text-white" />
        ) : (
          <VolumeX className="h-6 w-6 text-ink/60 dark:text-white/60" />
        )}
        
        {/* Subtle glow effect when playing */}
        {isPlaying && (
          <span className="absolute -inset-1 -z-10 animate-pulse rounded-full bg-teal-400/30 blur-md dark:bg-teal-400/20" />
        )}
      </button>
    </>
  );
}
