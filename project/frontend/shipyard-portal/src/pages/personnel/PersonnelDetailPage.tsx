import { useEffect, useState } from "react";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { PersonnelDetailScreen } from "../../features/personnel/components/PersonnelDetailScreen";
import {
  deletePersonnel,
  getPersonnelDetail,
  getPersonnelMonthlyActivity
} from "../../features/personnel/services/personnelService";
import type { PersonnelDetail, PersonnelMonthlyActivity } from "../../features/personnel/types";
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
  const [deleting, setDeleting] = useState(false);
  const [activityMonth, setActivityMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setPersonnelDetail(null);

      try {
        const response = await getPersonnelDetail(employeeId);

        if (!cancelled) {
          setPersonnelDetail(response);
        }
      } catch {
        if (!cancelled) {
          setError("Personel detayi su anda alinamadi. Lutfen tekrar deneyin.");
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
  }, [employeeId]);

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
        onActivityMonthChange={(year, month) => setActivityMonth({ year, month })}
        onBack={() => navigateTo("/personel")}
        onDelete={handleDelete}
        onEdit={() => navigateTo(`/personel/${encodeURIComponent(employeeId)}/duzenle`)}
      />
    </div>
  );
}
