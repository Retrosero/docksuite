import { useCallback, useEffect, useState } from "react";
import { createHrSetupMaster, fetchHrSetupData } from "../services/hrSetupService";
import type { HrSetupData, HrSetupQuickCreateInput } from "../types";

type UseHrSetupDataResult = {
  data: HrSetupData | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
  saveMessage: string | null;
  refresh: () => void;
  createMaster: (input: HrSetupQuickCreateInput) => Promise<void>;
};

export function useHrSetupData(): UseHrSetupDataResult {
  const [data, setData] = useState<HrSetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchHrSetupData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("IK kurulum verisi su anda alinamadi. Backend ve kullanici yetkilerini kontrol edin.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const createMaster = useCallback(
    async (input: HrSetupQuickCreateInput) => {
      setSaving(true);
      setSaveError(null);
      setSaveMessage(null);

      try {
        await createHrSetupMaster(input);
        setSaveMessage("Kayit olusturuldu.");
        refresh();
      } catch (createError) {
        const message = createError instanceof Error ? createError.message : "Kayit olusturulamadi.";
        setSaveError(message);
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  return {
    data,
    loading,
    error,
    saving,
    saveError,
    saveMessage,
    refresh,
    createMaster
  };
}

