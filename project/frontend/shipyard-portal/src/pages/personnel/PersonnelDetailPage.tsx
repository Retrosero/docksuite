import { useCallback, useEffect, useState } from "react";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { PersonnelDetailScreen } from "../../features/personnel/components/PersonnelDetailScreen";
import {
  deletePersonnelDocumentRecord,
  deletePersonnel,
  getPersonnelDetail,
  getPersonnelMonthlyActivity,
  upsertPersonnelDocumentRecord
} from "../../features/personnel/services/personnelService";
import type { PersonnelDetail, PersonnelDocumentRecordInput, PersonnelMonthlyActivity } from "../../features/personnel/types";
import { navigateTo } from "../../app/useAppRoute";

type PersonnelDetailPageProps = {
  employeeId: string;
};

export function PersonnelDetailPage({ employeeId }: PersonnelDetailPageProps) {
  const [personnelDetail, setPersonnelDetail] = useState<PersonnelDetail | null>(null);
  const [monthlyActivity, setMonthlyActivity] = useState<PersonnelMonthlyActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [documentMessage, setDocumentMessage] = useState<string | null>(null);
  const [documentSaving, setDocumentSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activityMonth, setActivityMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const loadPersonnelDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPersonnelDetail(null);

    try {
      const response = await getPersonnelDetail(employeeId);
      setPersonnelDetail(response);
    } catch {
      setError("Personel detayi su anda alinamadi. Lutfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    void loadPersonnelDetail();
  }, [loadPersonnelDetail]);

  useEffect(() => {
    let cancelled = false;

    async function loadMonthlyActivity() {
      setActivityLoading(true);
      setActivityError(null);
      setMonthlyActivity(null);

      try {
        const response = await getPersonnelMonthlyActivity(employeeId, activityMonth.year, activityMonth.month);
        if (!cancelled) {
          setMonthlyActivity(response);
        }
      } catch {
        if (!cancelled) {
          setActivityError("Aylik hareketler su anda alinamadi. Lutfen tekrar deneyin.");
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    }

    void loadMonthlyActivity();
    return () => {
      cancelled = true;
    };
  }, [activityMonth.month, activityMonth.year, employeeId]);

  async function handleDelete() {
    if (!window.confirm("Bu personel kaydini silmek istediginize emin misiniz?")) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const deletedId = await deletePersonnel(employeeId);
      window.sessionStorage.setItem("shipyard-personnel-flash", `Personel kaydi silindi: ${deletedId}`);
      navigateTo("/personel");
    } catch (deleteActionError) {
      const message =
        deleteActionError instanceof Error && deleteActionError.message.trim().length > 0
          ? deleteActionError.message
          : "Personel kaydi silinemedi.";
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDocumentSave(input: PersonnelDocumentRecordInput) {
    setDocumentSaving(true);
    setDocumentError(null);
    setDocumentMessage(null);

    try {
      const savedId = await upsertPersonnelDocumentRecord(input);
      setDocumentMessage(`Belge kaydi guncellendi: ${savedId}`);
      await loadPersonnelDetail();
    } catch (actionError) {
      const message =
        actionError instanceof Error && actionError.message.trim().length > 0
          ? actionError.message
          : "Belge kaydi guncellenemedi.";
      setDocumentError(message);
    } finally {
      setDocumentSaving(false);
    }
  }

  async function handleDocumentDelete(recordId: string) {
    if (!window.confirm("Bu belge kaydini silmek istediginize emin misiniz?")) {
      return;
    }

    setDocumentSaving(true);
    setDocumentError(null);
    setDocumentMessage(null);

    try {
      const deletedId = await deletePersonnelDocumentRecord(recordId);
      setDocumentMessage(`Belge kaydi silindi: ${deletedId}`);
      await loadPersonnelDetail();
    } catch (actionError) {
      const message =
        actionError instanceof Error && actionError.message.trim().length > 0
          ? actionError.message
          : "Belge kaydi silinemedi.";
      setDocumentError(message);
    } finally {
      setDocumentSaving(false);
    }
  }

  return (
    <div className="operations-page">
      <SectionIntro
        chip="Employee API"
        description="Secili personelin kimlik, operasyon ve IK bilgileri tek sayfada goruntulenir."
        eyebrow="Personel detayi"
        title="Calisan karti"
      />
      <PersonnelDetailScreen
        employee={personnelDetail}
        deleteError={deleteError}
        deleting={deleting}
        activity={monthlyActivity}
        activityLoading={activityLoading}
        activityError={activityError}
        activityMonth={activityMonth}
        error={error}
        loading={loading}
        documentError={documentError}
        documentMessage={documentMessage}
        documentSaving={documentSaving}
        onActivityMonthChange={(year, month) => setActivityMonth({ year, month })}
        onBack={() => navigateTo("/personel")}
        onDocumentDelete={handleDocumentDelete}
        onDocumentSave={handleDocumentSave}
        onDelete={handleDelete}
        onEdit={() => navigateTo(`/personel/${encodeURIComponent(employeeId)}/duzenle`)}
      />
    </div>
  );
}
