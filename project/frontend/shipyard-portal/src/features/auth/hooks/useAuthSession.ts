import { useCallback, useEffect, useState } from "react";
import { getAuthSession, loginWithPassword, logoutSession } from "../services/authService";

export function useAuthSession() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const session = await getAuthSession();
    setIsAuthenticated(session.isAuthenticated);
    setUserId(session.userId);
    return session;
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const session = await getAuthSession();
        if (!active) {
          return;
        }
        setIsAuthenticated(session.isAuthenticated);
        setUserId(session.userId);
      } catch (error) {
        if (!active) {
          return;
        }
        setIsAuthenticated(false);
        setUserId(null);
        setErrorMessage(error instanceof Error ? error.message : "Oturum kontrolu yapilamadi.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const session = await loginWithPassword(username, password);
      setIsAuthenticated(session.isAuthenticated);
      setUserId(session.userId);
      if (!session.isAuthenticated) {
        setErrorMessage("Giris tamamlanamadi. Kullanici bilgilerini kontrol edin.");
      }
      return session.isAuthenticated;
    } catch (error) {
      setIsAuthenticated(false);
      setUserId(null);
      setErrorMessage(error instanceof Error ? error.message : "Giris islemi basarisiz.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await logoutSession();
    } catch {
      // Even if backend logout fails, force local session state to logged-out.
    } finally {
      setIsAuthenticated(false);
      setUserId(null);
      setIsSubmitting(false);
    }
  }, []);

  return {
    isLoading,
    isSubmitting,
    isAuthenticated,
    userId,
    errorMessage,
    login,
    logout,
    refresh
  };
}
