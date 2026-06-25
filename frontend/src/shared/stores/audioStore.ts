import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  isPlaying: boolean;
  volume: number;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      isPlaying: false, // Default to false since browsers block autoplay
      volume: 0.3, // Soft default volume
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setVolume: (volume) => set({ volume }),
    }),
    {
      name: "audio-storage",
    }
  )
);
