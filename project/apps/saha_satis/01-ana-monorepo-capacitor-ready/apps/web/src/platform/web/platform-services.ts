import type { PlatformServicesFactory } from "@saha-satis/platform-bridge";
import { WebAppLifecycleService } from "./app-lifecycle.service";
import { WebBarcodeService } from "./barcode.service";
import { WebCameraService } from "./camera.service";
import { WebFileService } from "./file.service";
import { WebNetworkService } from "./network.service";
import { WebPushService } from "./push.service";
import { WebShareService } from "./share.service";

export function createWebPlatformServices(): PlatformServicesFactory {
  return {
    camera: new WebCameraService(),
    network: new WebNetworkService(),
    share: new WebShareService(),
    file: new WebFileService(),
    appLifecycle: new WebAppLifecycleService(),
    push: new WebPushService(),
    barcode: new WebBarcodeService()
  };
}
