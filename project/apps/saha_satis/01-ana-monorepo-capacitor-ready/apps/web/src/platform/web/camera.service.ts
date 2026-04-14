import type { CameraResult, CameraService } from "@saha-satis/platform-bridge";

export class WebCameraService implements CameraService {
  async takePhoto(): Promise<CameraResult | null> {
    return null;
  }

  async pickFromGallery(): Promise<CameraResult | null> {
    return null;
  }
}
