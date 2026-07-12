import { useEffect } from "react";
import { getAnonymousClientId } from "../utils/anonymousClientId";
import { httpClient } from "../api/httpClient";

const TRACKING_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const LAST_TRACKED_KEY = "triet_last_page_visit";

/** djb2-style string hash, returned as a hex string */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/** Compute a simple canvas fingerprint hash */
function getCanvasHash(): string | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("fingerprint", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("fingerprint", 4, 17);
    return simpleHash(canvas.toDataURL());
  } catch {
    return null;
  }
}

/** Get GPU renderer name */
function getGpuRenderer(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return null;
    const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return null;
    return (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || null;
  } catch {
    return null;
  }
}

/** Get battery info (async, may not be supported) */
async function getBatteryInfo(): Promise<{ level: number | null; charging: boolean | null }> {
  try {
    const battery = await (navigator as any).getBattery?.();
    if (!battery) return { level: null, charging: null };
    return {
      level: Math.round(battery.level * 100),
      charging: battery.charging,
    };
  } catch {
    return { level: null, charging: null };
  }
}

export function usePageViewTracking() {
  useEffect(() => {
    const trackVisit = async () => {
      const now = Date.now();
      const lastTracked = localStorage.getItem(LAST_TRACKED_KEY);

      // Check if we already tracked a visit recently
      if (lastTracked && now - parseInt(lastTracked, 10) < TRACKING_INTERVAL_MS) {
        return;
      }

      try {
        const clientId = getAnonymousClientId();
        const nav = navigator as any;
        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
        const battery = await getBatteryInfo();
        const gpuRenderer = getGpuRenderer();

        await httpClient.post("/tracking/visit", {
          anonymousClientId: clientId,

          // Screen & display
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          pixelRatio: window.devicePixelRatio || null,
          colorDepth: window.screen.colorDepth || null,

          // Hardware
          cpuCores: navigator.hardwareConcurrency || null,
          deviceMemory: nav.deviceMemory || null,
          maxTouchPoints: navigator.maxTouchPoints ?? null,
          gpuRenderer,

          // Network
          connectionType: conn?.effectiveType || null,
          downlinkSpeed: conn?.downlink || null,

          // Preferences & capabilities
          cookiesEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack === "1",
          darkMode: window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? null,
          reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? null,
          pdfViewer: nav.pdfViewerEnabled ?? null,
          pluginsCount: navigator.plugins?.length ?? null,

          // Locale & context
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          languages: navigator.languages?.join(", ") || null,
          platform: nav.userAgentData?.platform || navigator.platform || null,
          pageUrl: window.location.href,

          // Fingerprints
          canvasHash: getCanvasHash(),
          webglHash: gpuRenderer ? simpleHash(gpuRenderer) : null,

          // Battery
          batteryLevel: battery.level,
          batteryCharging: battery.charging,
        });

        // Record the time we successfully tracked
        localStorage.setItem(LAST_TRACKED_KEY, now.toString());
      } catch (error) {
        console.error("Failed to track page visit", error);
      }
    };

    // Track on mount
    void trackVisit();
  }, []);
}
