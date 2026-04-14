import type { FileService } from "@saha-satis/platform-bridge";

export class WebFileService implements FileService {
  async download(url: string, fileName = "dosya"): Promise<void> {
    if (typeof document === "undefined") {
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
