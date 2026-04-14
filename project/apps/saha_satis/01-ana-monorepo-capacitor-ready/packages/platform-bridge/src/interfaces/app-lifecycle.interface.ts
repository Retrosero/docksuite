export interface AppLifecycleService {
  onResume(listener: () => void): () => void;
  onPause(listener: () => void): () => void;
}
