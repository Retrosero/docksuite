import { useEffect, useState } from "react";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { PersonnelDetailScreen } from "../../features/personnel/components/PersonnelDetailScreen";
import { deletePersonnel, getPersonnelDetail } from "../../features/personnel/services/personnelService";
import type { PersonnelDetail } from "../../features/personnel/types";
import { navigateTo } from "../../app/useAppRoute";

type PersonnelDetailPageProps = {
  employeeId: string;
};

export function PersonnelDetailPage({ employeeId }: PersonnelDetailPageProps) {
  const [personnelDetail, setPersonnelDetail] = useState<PersonnelDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
        error={error}
        loading={loading}
        onBack={() => navigateTo("/personel")}
        onDelete={handleDelete}
        onEdit={() => navigateTo(`/personel/${encodeURIComponent(employeeId)}/duzenle`)}
      />
    </div>
  );
}
