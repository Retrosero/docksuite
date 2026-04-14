import type { BarcodeScanResult, BarcodeService } from "@saha-satis/platform-bridge";

export class WebBarcodeService implements BarcodeService {
  async scan(): Promise<BarcodeScanResult | null> {
    // Faz 0 placeholder: tarayıcıda barkod okuma sonraki fazlarda entegrasyonla eklenecek.
    return null;
  }
}
