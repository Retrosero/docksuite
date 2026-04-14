export interface PushNotificationService {
  requestPermission(): Promise<boolean>;
  register(): Promise<void>;
}
