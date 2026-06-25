import { RouterProvider } from "react-router-dom";

import { Providers } from "./providers";
import { router } from "./router";
import { ThemeProvider } from "./ThemeProvider";
import { AtmosphereBackground } from "./AtmosphereBackground";
import { MusicPlayer } from "../shared/components/MusicPlayer";

export function App() {
  return (
    <ThemeProvider>
      <Providers>
        <AtmosphereBackground />
        <MusicPlayer />
        <RouterProvider router={router} />
      </Providers>
    </ThemeProvider>
  );
}

