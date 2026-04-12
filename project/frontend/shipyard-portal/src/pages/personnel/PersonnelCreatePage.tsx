import { useState } from "react";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { PersonnelCreateForm } from "../../features/personnel/components/PersonnelCreateForm";
import { createPersonnel } from "../../features/personnel/services/personnelService";
import type { PersonnelCreateInput } from "../../features/personnel/types";
import { navigateTo } from "../../app/useAppRoute";

export function PersonnelCreatePage() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(input: PersonnelCreateInput) {
    setSaving(true);
    setError(null);

    try {
      const employeeId = await createPersonnel(input);
      navigateTo(`/personel/${encodeURIComponent(employeeId)}`);
    } catch {
      setError("Personel kaydi olusturulamadi. Alanlari kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="operations-page">
      <SectionIntro
        chip="Employee API"
        description="Yeni personel kaydi ERPNext Employee kaynagina yazilir ve kayit detayina yonlendirilir."
        eyebrow="Personel olustur"
        title="Yeni personel ekle"
      />
      <PersonnelCreateForm error={error} onCancel={() => navigateTo("/personel")} onSubmit={handleCreate} saving={saving} />
    </div>
  );
}
