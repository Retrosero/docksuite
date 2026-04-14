import type { AppLifecycleService } from "@saha-satis/platform-bridge";

export class WebAppLifecycleService implements AppLifecycleService {
  onResume(listener: () => void): () => void {
    const handler = () => {
      if (document.visibilityState === "visible") {
        listener();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }

  onPause(listener: () => void): () => void {
    const handler = () => {
      if (document.visibilityState === "hidden") {
        listener();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }
}
