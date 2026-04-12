import { useEffect, useState } from "react";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { PersonnelDetailScreen } from "../../features/personnel/components/PersonnelDetailScreen";
import { getPersonnelDetail } from "../../features/personnel/services/personnelService";
import type { PersonnelDetail } from "../../features/personnel/types";
import { navigateTo } from "../../app/useAppRoute";

type PersonnelDetailPageProps = {
  employeeId: string;
};

export function PersonnelDetailPage({ employeeId }: PersonnelDetailPageProps) {
  const [personnelDetail, setPersonnelDetail] = useState<PersonnelDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        error={error}
        loading={loading}
        onBack={() => navigateTo("/personel")}
      />
    </div>
  );
}
