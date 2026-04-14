export interface CameraResult {
  uri: string;
  width?: number;
  height?: number;
}

export interface CameraService {
  takePhoto(): Promise<CameraResult | null>;
  pickFromGallery(): Promise<CameraResult | null>;
}
