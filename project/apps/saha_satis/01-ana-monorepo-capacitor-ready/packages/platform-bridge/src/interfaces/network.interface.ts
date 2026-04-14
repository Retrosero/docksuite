export interface NetworkState {
  connected: boolean;
  connectionType?: string;
}

export interface NetworkService {
  getStatus(): Promise<NetworkState>;
  subscribe(listener: (state: NetworkState) => void): () => void;
}
