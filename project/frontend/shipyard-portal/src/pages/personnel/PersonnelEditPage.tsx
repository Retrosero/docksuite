import { useEffect, useState } from "react";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { PersonnelCreateForm } from "../../features/personnel/components/PersonnelCreateForm";
import { getPersonnelDetail, updatePersonnel } from "../../features/personnel/services/personnelService";
import type { PersonnelCreateInput, PersonnelDetail } from "../../features/personnel/types";
import { navigateTo } from "../../app/useAppRoute";

type PersonnelEditPageProps = {
  employeeId: string;
};

function sanitize(value: string) {
  return value === "-" ? "" : value;
}

function toFormValue(employee: PersonnelDetail): PersonnelCreateInput {
  return {
    employeeName: sanitize(employee.fullName),
    firstName: sanitize(employee.firstName),
    lastName: sanitize(employee.lastName),
    company: sanitize(employee.company),
    status: sanitize(employee.status) || "Active",
    gender: sanitize(employee.gender),
    department: sanitize(employee.department),
    designation: sanitize(employee.designation),
    branch: sanitize(employee.branch),
    joinDate: employee.joinDate ?? "",
    birthDate: employee.birthDate ?? "",
    phone: sanitize(employee.phone),
    emergencyPhone: sanitize(employee.emergencyPhone),
    companyEmail: sanitize(employee.companyEmail),
    email: sanitize(employee.email),
    currentAddress: sanitize(employee.currentAddress),
    permanentAddress: sanitize(employee.permanentAddress),
    reportsTo: sanitize(employee.reportsTo),
    shipyardTeam: sanitize(employee.shipyardTeam),
    shipyardSpecialty: sanitize(employee.shipyardSpecialty)
  };
}

export function PersonnelEditPage({ employeeId }: PersonnelEditPageProps) {
  const [initialValue, setInitialValue] = useState<PersonnelCreateInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await getPersonnelDetail(employeeId);

        if (!cancelled) {
          setInitialValue(response ? toFormValue(response) : null);
          if (!response) {
            setError("Duzenlenecek personel kaydi bulunamadi.");
          }
        }
      } catch {
        if (!cancelled) {
          setError("Personel duzenleme formu acilamadi. Lutfen tekrar deneyin.");
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

  async function handleSubmit(input: PersonnelCreateInput) {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedId = await updatePersonnel(employeeId, input);
      setSuccessMessage("Personel basariyla guncellendi. Detay ekranina yonlendiriliyorsun.");
      window.setTimeout(() => {
        window.sessionStorage.setItem("shipyard-personnel-flash", `Personel kaydi guncellendi: ${updatedId}`);
        navigateTo(`/personel/${encodeURIComponent(updatedId)}`);
      }, 900);
    } catch (submitError) {
      const message =
        submitError instanceof Error && submitError.message.trim().length > 0 ? submitError.message : null;
      setError(message ?? "Personel kaydi guncellenemedi. Alanlari kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="operations-page">
      <SectionIntro
        chip="Employee API"
        description="Mevcut personel kaydinin temel, iletisim ve tersane detaylari tek formdan guncellenir. ERPNext zorunlu alanlar bos birakilamaz."
        eyebrow="Personel duzenle"
        title="Personel bilgisini guncelle"
      />
      {loading ? <p className="personnel-state">Duzenleme formu yukleniyor...</p> : null}
      {!loading && initialValue ? (
        <PersonnelCreateForm
          eyebrow="Personel duzenle"
          error={error}
          initialValue={initialValue}
          onCancel={() => navigateTo(`/personel/${encodeURIComponent(employeeId)}`)}
          onSubmit={handleSubmit}
          saving={saving}
          submitLabel="Degisiklikleri kaydet"
          successMessage={successMessage}
          title="Employee kaydini guncelle"
        />
      ) : null}
      {!loading && !initialValue && error ? <p className="personnel-state personnel-state--error">{error}</p> : null}
    </div>
  );
}
