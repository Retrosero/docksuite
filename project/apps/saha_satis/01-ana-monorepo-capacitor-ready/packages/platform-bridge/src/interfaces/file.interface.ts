export interface FileService {
  download(url: string, fileName?: string): Promise<void>;
}
