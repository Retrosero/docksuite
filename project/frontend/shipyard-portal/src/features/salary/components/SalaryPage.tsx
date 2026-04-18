import { useEffect, useState } from "react";
import type { BenefitItem, SalaryInfo } from "../types";
import {
  fetchActiveEmployeeOptions,
  fetchBenefits,
  fetchSalaryInfo,
  updateEmployeeSalary,
  type SalaryEmployeeOption
} from "../services/salaryService";
import { BenefitList } from "./BenefitList";
import { SalaryInfoCard } from "./SalaryInfoCard";

type SalaryFormState = {
  baseSalary: string;
  currency: string;
};

const INITIAL_FORM: SalaryFormState = {
  baseSalary: "",
  currency: "TRY"
};

function toFormState(salaryInfo: SalaryInfo | null): SalaryFormState {
  if (!salaryInfo) {
    return INITIAL_FORM;
  }

  return {
    baseSalary: salaryInfo.baseSalary > 0 ? String(salaryInfo.baseSalary) : "",
    currency: salaryInfo.currency || "TRY"
  };
}

export function SalaryPage() {
  const [employees, setEmployees] = useState<SalaryEmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [salaryInfo, setSalaryInfo] = useState<SalaryInfo | null>(null);
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [form, setForm] = useState<SalaryFormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      setLoading(true);
      setError(null);

      try {
        const rows = await fetchActiveEmployeeOptions();

        if (cancelled) {
          return;
        }

        setEmployees(rows);
        setSelectedEmployeeId((current) => current || rows[0]?.id || "");
      } catch {
        if (!cancelled) {
          setError("Personel listesi yuklenemedi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSalaryDetail() {
      if (!selectedEmployeeId) {
        setSalaryInfo(null);
        setBenefits([]);
        setForm(INITIAL_FORM);
        return;
      }

      setDetailLoading(true);
      setError(null);
      setSaveMessage(null);

      try {
        const [nextSalaryInfo, nextBenefits] = await Promise.all([
          fetchSalaryInfo(selectedEmployeeId),
          fetchBenefits(selectedEmployeeId)
        ]);

        if (cancelled) {
          return;
        }

        setSalaryInfo(nextSalaryInfo);
        setBenefits(nextBenefits);
        setForm(toFormState(nextSalaryInfo));
      } catch {
        if (!cancelled) {
          setError("Maaş detaylari yuklenemedi.");
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    }

    void loadSalaryDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedEmployeeId]);

  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId) ?? null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEmployeeId) {
      setError("Lutfen once personel secin.");
      return;
    }

    const parsedSalary = Number(form.baseSalary);
    if (!Number.isFinite(parsedSalary) || parsedSalary <= 0) {
      setError("Aylik temel maas sifirdan buyuk olmalidir.");
      return;
    }

    const normalizedCurrency = form.currency.trim().toUpperCase();
    if (normalizedCurrency.length < 3) {
      setError("Para birimi en az 3 karakter olmali.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const nextSalaryInfo = await updateEmployeeSalary(selectedEmployeeId, parsedSalary, normalizedCurrency);
      const nextBenefits = await fetchBenefits(selectedEmployeeId);

      setSalaryInfo(nextSalaryInfo);
      setBenefits(nextBenefits);
      setForm(toFormState(nextSalaryInfo));
      setSaveMessage("Maas kaydi guncellendi.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Maas kaydi guncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="salary-page-stack">
      <section className="screen-card">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Maas Yonetimi</p>
            <h3>Personel Maas ve Ek Odeme Kayitlari</h3>
          </div>
        </div>

        {loading ? <p className="salary-page-state">Yukleniyor...</p> : null}
        {error ? <p className="salary-page-state salary-page-state--error">{error}</p> : null}

        {!loading && employees.length === 0 ? (
          <p className="salary-page-state">Personel bulunamadi.</p>
        ) : null}

        {!loading && employees.length > 0 ? (
          <>
            <div className="salary-employee-select">
              <label>
                <span>Personel secin</span>
                <select value={selectedEmployeeId} onChange={(event) => setSelectedEmployeeId(event.target.value)}>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="salary-detail-grid">
              <SalaryInfoCard loading={detailLoading} salaryInfo={salaryInfo} />
              <BenefitList loading={detailLoading} benefits={benefits} />

              <article className="salary-editor-card">
                <div className="panel__header">
                  <div>
                    <p className="eyebrow">Maas Kaydi</p>
                    <h3>{selectedEmployee ? `${selectedEmployee.name} icin maas tanimi` : "Maas tanimi"}</h3>
                  </div>
                </div>

                <p className="salary-editor-note">
                  Bu alan personel kartindaki tekrar uygulanabilir custom maas alanini gunceller. Bordro hesaplama ekrani
                  bu kaydi otomatik kullanir.
                </p>

                <form className="salary-editor-form" onSubmit={(event) => void handleSubmit(event)}>
                  <label>
                    <span>Aylik temel maas</span>
                    <input
                      inputMode="decimal"
                      min="0"
                      name="baseSalary"
                      onChange={(event) => setForm((current) => ({ ...current, baseSalary: event.target.value }))}
                      placeholder="Orn. 45000"
                      step="0.01"
                      type="number"
                      value={form.baseSalary}
                    />
                  </label>

                  <label>
                    <span>Para birimi</span>
                    <input
                      maxLength={6}
                      name="currency"
                      onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                      placeholder="TRY"
                      type="text"
                      value={form.currency}
                    />
                  </label>

                  <div className="salary-editor-actions">
                    <button className="btn btn--primary" disabled={saving || detailLoading || !selectedEmployeeId} type="submit">
                      {saving ? "Kaydediliyor..." : salaryInfo ? "Maasi guncelle" : "Maas ekle"}
                    </button>
                    <button
                      className="btn btn--secondary"
                      disabled={saving}
                      onClick={() => setForm(toFormState(salaryInfo))}
                      type="button"
                    >
                      Formu sifirla
                    </button>
                  </div>
                </form>

                {saveMessage ? <p className="salary-editor-success">{saveMessage}</p> : null}
              </article>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
