import { useState } from "react";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { PersonnelCreateForm } from "../../features/personnel/components/PersonnelCreateForm";
import { createPersonnel } from "../../features/personnel/services/personnelService";
import type { PersonnelCreateInput } from "../../features/personnel/types";
import { navigateTo } from "../../app/useAppRoute";

export function PersonnelCreatePage() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleCreate(input: PersonnelCreateInput) {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const employeeId = await createPersonnel(input);
      setSuccessMessage("Personel basariyla olusturuldu. Listeye yonlendiriliyorsun.");
      window.setTimeout(() => {
        window.sessionStorage.setItem(
          "shipyard-personnel-flash",
          `Personel basariyla olusturuldu: ${employeeId}`
        );
        navigateTo("/personel");
      }, 900);
    } catch (error) {
      const message = error instanceof Error && error.message.trim().length > 0 ? error.message : null;
      setError(message ?? "Personel kaydi olusturulamadi. Alanlari kontrol edip tekrar deneyin.");
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
      <PersonnelCreateForm
        eyebrow="Yeni personel"
        error={error}
        initialValue={undefined}
        onCancel={() => navigateTo("/personel")}
        onSubmit={handleCreate}
        saving={saving}
        submitLabel="Personel olustur"
        successMessage={successMessage}
        title="Employee kaydi olustur"
      />
    </div>
  );
}
