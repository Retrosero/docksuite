import type { NetworkService, NetworkState } from "@saha-satis/platform-bridge";

export class WebNetworkService implements NetworkService {
  async getStatus(): Promise<NetworkState> {
    return {
      connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
      connectionType: 'web',
    };
  }

  subscribe(listener: (state: NetworkState) => void): () => void {
    const handle = () => listener({ connected: navigator.onLine, connectionType: 'web' });
    window.addEventListener('online', handle);
    window.addEventListener('offline', handle);
    return () => {
      window.removeEventListener('online', handle);
      window.removeEventListener('offline', handle);
    };
  }
}
