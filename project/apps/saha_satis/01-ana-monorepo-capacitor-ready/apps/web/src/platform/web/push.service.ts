import type { PushNotificationService } from "@saha-satis/platform-bridge";

export class WebPushService implements PushNotificationService {
  async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    const result = await Notification.requestPermission();
    return result === "granted";
  }

  async register(): Promise<void> {
    // Faz 0 placeholder: gerçek web push kaydı sonraki fazlarda eklenecek.
  }
}
