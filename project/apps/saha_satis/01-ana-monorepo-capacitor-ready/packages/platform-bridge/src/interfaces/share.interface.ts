export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
}

export interface ShareService {
  share(payload: SharePayload): Promise<void>;
}
