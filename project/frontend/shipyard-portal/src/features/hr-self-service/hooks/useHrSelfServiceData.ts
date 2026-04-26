import { useCallback, useEffect, useState } from "react";
import {
  fetchHrSelfServiceData,
  uploadHrSelfServiceDocumentFile,
  upsertHrSelfServiceDocumentRecord
} from "../services/hrSelfServiceService";
import type { HrSelfServiceData, HrSelfServiceDocumentRecordInput } from "../types";

type UseHrSelfServiceDataResult = {
  data: HrSelfServiceData | null;
  loading: boolean;
  error: string | null;
  actionError: string | null;
  actionMessage: string | null;
  savingDocument: boolean;
  uploadingDocument: boolean;
  clearActionMessage: () => void;
  refresh: () => void;
  saveDocumentRecord: (input: HrSelfServiceDocumentRecordInput) => Promise<boolean>;
  uploadDocumentFile: (file: File, isPrivate: boolean) => Promise<string | null>;
};

export function useHrSelfServiceData(): UseHrSelfServiceDataResult {
  const [data, setData] = useState<HrSelfServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [savingDocument, setSavingDocument] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const clearActionMessage = useCallback(() => {
    setActionError(null);
    setActionMessage(null);
  }, []);

  const saveDocumentRecord = useCallback(async (input: HrSelfServiceDocumentRecordInput) => {
    setSavingDocument(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const recordId = await upsertHrSelfServiceDocumentRecord(input);
      setActionMessage(`Belge kaydi olusturuldu: ${recordId}`);
      setRefreshToken((value) => value + 1);
      return true;
    } catch (saveError) {
      const message =
        saveError instanceof Error && saveError.message.trim().length > 0
          ? saveError.message
          : "Belge kaydi olusturulamadi.";
      setActionError(message);
      return false;
    } finally {
      setSavingDocument(false);
    }
  }, []);

  const uploadDocumentFile = useCallback(async (file: File, isPrivate: boolean) => {
    setUploadingDocument(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const uploaded = await uploadHrSelfServiceDocumentFile({ file, isPrivate });
      setActionMessage(`Dosya yuklendi: ${uploaded.fileName}`);
      setRefreshToken((value) => value + 1);
      return uploaded.fileRef;
    } catch (uploadError) {
      const message =
        uploadError instanceof Error && uploadError.message.trim().length > 0
          ? uploadError.message
          : "Dosya yuklenemedi.";
      setActionError(message);
      return null;
    } finally {
      setUploadingDocument(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const payload = await fetchHrSelfServiceData();
        if (!cancelled) {
          setData(payload);
        }
      } catch {
        if (!cancelled) {
          setError("Calisan paneli verisi alinamadi. Yetki ve backend erisimini kontrol edin.");
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

  return {
    data,
    loading,
    error,
    actionError,
    actionMessage,
    savingDocument,
    uploadingDocument,
    clearActionMessage,
    refresh,
    saveDocumentRecord,
    uploadDocumentFile
  };
}
