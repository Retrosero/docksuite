import { useState } from "react";
import type { PersonnelCreateInput } from "../types";

const EMPLOYEE_REQUIRED_FIELDS: Array<{
  field: keyof PersonnelCreateInput;
  label: string;
}> = [
  { field: "firstName", label: "Ad" },
  { field: "company", label: "Şirket" },
  { field: "gender", label: "Cinsiyet" },
  { field: "birthDate", label: "Doğum tarihi" },
  { field: "joinDate", label: "İşe giriş tarihi" }
];

type PersonnelCreateFormProps = {
  eyebrow: string;
  title: string;
  submitLabel: string;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  onSubmit: (input: PersonnelCreateInput) => void | Promise<void>;
  onCancel: () => void;
  initialValue?: PersonnelCreateInput;
};

const INITIAL_FORM: PersonnelCreateInput = {
  employeeName: "",
  firstName: "",
  lastName: "",
  company: "",
  status: "Active",
  gender: "",
  department: "",
  designation: "",
  branch: "",
  joinDate: "",
  birthDate: "",
  phone: "",
  emergencyPhone: "",
  companyEmail: "",
  email: "",
  currentAddress: "",
  permanentAddress: "",
  reportsTo: "",
  shipyardTeam: "",
  shipyardSpecialty: ""
};

export function PersonnelCreateForm({
  eyebrow,
  title,
  submitLabel,
  saving,
  error,
  successMessage,
  onSubmit,
  onCancel,
  initialValue
}: PersonnelCreateFormProps) {
  const [form, setForm] = useState(initialValue ?? INITIAL_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);

  function getMissingRequiredFields() {
    return EMPLOYEE_REQUIRED_FIELDS.filter(({ field }) => !String(form[field]).trim()).map(({ label }) => label);
  }

  function updateField<K extends keyof PersonnelCreateInput>(field: K, value: PersonnelCreateInput[K]) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const missingFields = getMissingRequiredFields();

    if (missingFields.length > 0) {
      setValidationError(`ERPNext uyumlu zorunlu alanlar eksik: ${missingFields.join(", ")}.`);
      return;
    }

    await onSubmit(form);
  }

  return (
    <section className="screen-card personnel-screen">
      <div className="panel__header personnel-screen__header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        <button className="personnel-back-button" onClick={onCancel} type="button">
          Vazgec
        </button>
      </div>

      {validationError ? <p className="personnel-state personnel-state--error">{validationError}</p> : null}
      {error ? <p className="personnel-state personnel-state--error">{error}</p> : null}
      {successMessage ? <p className="personnel-state personnel-state--success">{successMessage}</p> : null}

      <form className="personnel-form" onSubmit={handleSubmit}>
        <div className="personnel-form__guide">
          <article>
            <span>1</span>
            <div>
              <strong>Temel kart</strong>
              <p>Personelin kimlik ve organizasyon bilgisini girin. ERPNext zorunlu alanlar doldurulmadan kayıt ilerlemez.</p>
            </div>
          </article>
          <article>
            <span>2</span>
            <div>
              <strong>Daha fazla bilgi</strong>
              <p>Iletisim, adres ve acil durum alanlarini tamamlayin.</p>
            </div>
          </article>
          <article>
            <span>3</span>
            <div>
              <strong>Tersane baglami</strong>
              <p>Ekip, uzmanlik ve amir bilgisini ekleyin.</p>
            </div>
          </article>
        </div>

        <section className="personnel-form__section">
          <div className="personnel-form__section-head">
            <p className="eyebrow">Temel bilgiler</p>
            <h4>Kimlik ve durum</h4>
          </div>
          <div className="personnel-form__grid">
            <label>
              Ad soyad
              <input
                onChange={(event) => updateField("employeeName", event.target.value)}
                placeholder="Ornek: Ahmet Demir, boş bırakırsan ad + soyaddan üretilecek"
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
              Soyad
              <input
                onChange={(event) => updateField("lastName", event.target.value)}
                placeholder="Ornek: Demir"
                type="text"
                value={form.lastName}
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
                <option value="Suspended">Suspended</option>
                <option value="Left">Left</option>
              </select>
            </label>

            <label>
              Cinsiyet *
              <select onChange={(event) => updateField("gender", event.target.value)} required value={form.gender}>
                <option value="">Seciniz</option>
                <option value="Male">Erkek</option>
                <option value="Female">Kadin</option>
                <option value="Other">Diger</option>
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
              Sube
              <input
                onChange={(event) => updateField("branch", event.target.value)}
                placeholder="Ornek: Altinova"
                type="text"
                value={form.branch}
              />
            </label>

            <label>
              Ise giris tarihi *
              <input
                onChange={(event) => updateField("joinDate", event.target.value)}
                required
                type="date"
                value={form.joinDate}
              />
            </label>

            <label>
              Dogum tarihi *
              <input
                onChange={(event) => updateField("birthDate", event.target.value)}
                required
                type="date"
                value={form.birthDate}
              />
            </label>
          </div>
        </section>

        <section className="personnel-form__section">
          <div className="personnel-form__section-head">
            <p className="eyebrow">Iletisim</p>
            <h4>Daha fazla bilgi</h4>
          </div>
          <div className="personnel-form__grid">
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
              Acil durum telefonu
              <input
                onChange={(event) => updateField("emergencyPhone", event.target.value)}
                placeholder="Ornek: +90 5xx xxx xx xx"
                type="tel"
                value={form.emergencyPhone}
              />
            </label>

            <label>
              Sirket e-postasi
              <input
                onChange={(event) => updateField("companyEmail", event.target.value)}
                placeholder="Ornek: ahmet@tersane.com"
                type="email"
                value={form.companyEmail}
              />
            </label>

            <label>
              Kisisel e-posta
              <input
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Ornek: ahmet@ornek.com"
                type="email"
                value={form.email}
              />
            </label>

            <label className="personnel-form__field personnel-form__field--full">
              Guncel adres
              <textarea
                onChange={(event) => updateField("currentAddress", event.target.value)}
                placeholder="Personelin aktif adres bilgisi"
                rows={3}
                value={form.currentAddress}
              />
            </label>

            <label className="personnel-form__field personnel-form__field--full">
              Kalici adres
              <textarea
                onChange={(event) => updateField("permanentAddress", event.target.value)}
                placeholder="Kimlik veya resmi kayit adresi"
                rows={3}
                value={form.permanentAddress}
              />
            </label>
          </div>
        </section>

        <section className="personnel-form__section">
          <div className="personnel-form__section-head">
            <p className="eyebrow">Operasyon</p>
            <h4>Tersane baglanti alanlari</h4>
          </div>
          <div className="personnel-form__grid">
            <label>
              Amir
              <input
                onChange={(event) => updateField("reportsTo", event.target.value)}
                placeholder="Employee ID veya ad"
                type="text"
                value={form.reportsTo}
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
                placeholder="Ornek: Boru montaj"
                type="text"
                value={form.shipyardSpecialty}
              />
            </label>
          </div>
        </section>

        <div className="personnel-form__actions">
          <button className="personnel-create-button" disabled={saving} type="submit">
            {saving ? "Kaydediliyor..." : submitLabel}
          </button>
          <button className="personnel-back-button" disabled={saving} onClick={onCancel} type="button">
            Listeye don
          </button>
        </div>
      </form>
    </section>
  );
}
