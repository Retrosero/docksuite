import { useState } from "react";
import type { PersonnelCreateInput } from "../types";

type PersonnelCreateFormProps = {
  saving: boolean;
  error: string | null;
  onSubmit: (input: PersonnelCreateInput) => void | Promise<void>;
  onCancel: () => void;
};

const INITIAL_FORM: PersonnelCreateInput = {
  employeeName: "",
  firstName: "",
  company: "",
  status: "Active",
  department: "",
  designation: "",
  joinDate: "",
  phone: "",
  email: "",
  shipyardTeam: "",
  shipyardSpecialty: ""
};

export function PersonnelCreateForm({ saving, error, onSubmit, onCancel }: PersonnelCreateFormProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);

  function updateField<K extends keyof PersonnelCreateInput>(field: K, value: PersonnelCreateInput[K]) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    if (!form.employeeName.trim() || !form.firstName.trim() || !form.company.trim()) {
      setValidationError("Ad soyad, ad ve sirket alanlari zorunludur.");
      return;
    }

    await onSubmit(form);
  }

  return (
    <section className="screen-card personnel-screen">
      <div className="panel__header personnel-screen__header">
        <div>
          <p className="eyebrow">Yeni personel</p>
          <h3>Employee kaydi olustur</h3>
        </div>
        <button className="personnel-back-button" onClick={onCancel} type="button">
          Vazgec
        </button>
      </div>

      {validationError ? <p className="personnel-state personnel-state--error">{validationError}</p> : null}
      {error ? <p className="personnel-state personnel-state--error">{error}</p> : null}

      <form className="personnel-form" onSubmit={handleSubmit}>
        <label>
          Ad soyad *
          <input
            onChange={(event) => updateField("employeeName", event.target.value)}
            placeholder="Ornek: Ahmet Demir"
            required
            type="text"
            value={form.employeeName}
          />
        </label>

        <label>
          Ad *
          <input
            onChange={(event) => updateField("firstName", event.target.value)}
            placeholder="Ornek: Ahmet"
            required
            type="text"
            value={form.firstName}
          />
        </label>

        <label>
          Sirket *
          <input
            onChange={(event) => updateField("company", event.target.value)}
            placeholder="Ornek: DockSuite Tersane"
            required
            type="text"
            value={form.company}
          />
        </label>

        <label>
          Durum
          <select onChange={(event) => updateField("status", event.target.value)} value={form.status}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Left">Left</option>
          </select>
        </label>

        <label>
          Departman
          <input
            onChange={(event) => updateField("department", event.target.value)}
            placeholder="Ornek: Uretim"
            type="text"
            value={form.department}
          />
        </label>

        <label>
          Unvan
          <input
            onChange={(event) => updateField("designation", event.target.value)}
            placeholder="Ornek: Kaynak Ustasi"
            type="text"
            value={form.designation}
          />
        </label>

        <label>
          Ise giris tarihi
          <input onChange={(event) => updateField("joinDate", event.target.value)} type="date" value={form.joinDate} />
        </label>

        <label>
          Telefon
          <input
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="Ornek: +90 5xx xxx xx xx"
            type="tel"
            value={form.phone}
          />
        </label>

        <label>
          E-posta
          <input
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="Ornek: ahmet@ornek.com"
            type="email"
            value={form.email}
          />
        </label>

        <label>
          Shipyard ekip
          <input
            onChange={(event) => updateField("shipyardTeam", event.target.value)}
            placeholder="Opsiyonel - Team kayit adi"
            type="text"
            value={form.shipyardTeam}
          />
        </label>

        <label>
          Shipyard uzmanlik
          <input
            onChange={(event) => updateField("shipyardSpecialty", event.target.value)}
            placeholder="Opsiyonel"
            type="text"
            value={form.shipyardSpecialty}
          />
        </label>

        <div className="personnel-form__actions">
          <button className="personnel-create-button" disabled={saving} type="submit">
            {saving ? "Kaydediliyor..." : "Personel olustur"}
          </button>
          <button className="personnel-back-button" disabled={saving} onClick={onCancel} type="button">
            Listeye don
          </button>
        </div>
      </form>
    </section>
  );
}
