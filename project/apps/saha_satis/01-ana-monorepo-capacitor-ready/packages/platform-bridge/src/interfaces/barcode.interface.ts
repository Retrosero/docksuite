export interface BarcodeScanResult {
  value: string;
  format?: string;
}

export interface BarcodeService {
  scan(): Promise<BarcodeScanResult | null>;
}
