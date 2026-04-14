import type { SharePayload, ShareService } from "@saha-satis/platform-bridge";

export class WebShareService implements ShareService {
  async share(payload: SharePayload): Promise<void> {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(payload);
      return;
    }
    throw new Error("Web Share API desteklenmiyor.");
  }
}
