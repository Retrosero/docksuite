import { CameraService } from '../interfaces/camera.interface';
import { NetworkService } from '../interfaces/network.interface';
import { ShareService } from '../interfaces/share.interface';
import { FileService } from '../interfaces/file.interface';
import { AppLifecycleService } from '../interfaces/app-lifecycle.interface';
import { PushNotificationService } from '../interfaces/push.interface';
import { BarcodeService } from '../interfaces/barcode.interface';

export interface PlatformServicesFactory {
  camera: CameraService;
  network: NetworkService;
  share: ShareService;
  file: FileService;
  appLifecycle: AppLifecycleService;
  push: PushNotificationService;
  barcode: BarcodeService;
}
