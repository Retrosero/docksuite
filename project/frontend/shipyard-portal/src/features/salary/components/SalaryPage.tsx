import { useEffect, useState } from "react";
import { requestErpJson } from "../../../lib/erpApi";
import type { BenefitItem, SalaryInfo } from "../types";

type EmployeeRow = {
  name: string;
  employee_name: string;
};

type EmployeeManualSalaryRow = {
  name: string;
  shipyard_monthly_base_salary?: number;
  salary_currency?: string;
};

type SalaryStructureAssignmentRow = {
  name: string;
  employee: string;
  base: number;
  currency: string;
  salary_structure: string;
  effective_from: string;
};

type EmployeeSalary = {
  employeeId: string;
  employeeName: string;
  salaryInfo: SalaryInfo | null;
  benefits: BenefitItem[];
};

export function SalaryPage() {
  const [employees, setEmployees] = useState<EmployeeSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all employees
        const params = new URLSearchParams();
        params.set("fields", JSON.stringify(["name", "employee_name"]));
        params.set("limit_page_length", "300");
        params.set("filters", JSON.stringify([["status", "!=", "Left"]]));

        const empPayload = await requestErpJson<{ data?: EmployeeRow[] }>("/resource/Employee", params);
        const employeeRows = empPayload.data ?? [];

        // Fetch salary structure assignments for all employees
        let ssaRows: SalaryStructureAssignmentRow[] = [];
        try {
          const ssaParams = new URLSearchParams();
          ssaParams.set("fields", JSON.stringify(["name", "employee", "base", "currency", "salary_structure", "effective_from"]));
          ssaParams.set("limit_page_length", "300");

          const ssaPayload = await requestErpJson<{ data?: SalaryStructureAssignmentRow[] }>(
            "/resource/Salary Structure Assignment",
            ssaParams
          );
          ssaRows = ssaPayload.data ?? [];
        } catch {
          ssaRows = [];
        }

        // Optional manual salary field on Employee (custom field)
        let manualSalaryRows: EmployeeManualSalaryRow[] = [];
        try {
          const manualSalaryParams = new URLSearchParams();
          manualSalaryParams.set(
            "fields",
            JSON.stringify(["name", "shipyard_monthly_base_salary", "salary_currency"])
          );
          manualSalaryParams.set("limit_page_length", "300");

          const manualSalaryPayload = await requestErpJson<{ data?: EmployeeManualSalaryRow[] }>(
            "/resource/Employee",
            manualSalaryParams
          );
          manualSalaryRows = manualSalaryPayload.data ?? [];
        } catch {
          manualSalaryRows = [];
        }

        // Create a map of employee to salary info
        const salaryMap = new Map(ssaRows.map(row => [row.employee, row]));
        const manualSalaryMap = new Map(manualSalaryRows.map(row => [row.name, row]));

        // Build employee salary list
        const employeeSalaries: EmployeeSalary[] = employeeRows.map(emp => {
          const ssa = salaryMap.get(emp.name);
          const manualSalary = manualSalaryMap.get(emp.name);
          const manualAmount = Number(manualSalary?.shipyard_monthly_base_salary ?? 0);
          const hasManualSalary = Number.isFinite(manualAmount) && manualAmount > 0;
          return {
            employeeId: emp.name,
            employeeName: emp.employee_name ?? emp.name,
            salaryInfo: ssa ? {
              name: ssa.name,
              employee: ssa.employee,
              employee_name: emp.employee_name ?? emp.name,
              baseSalary: ssa.base ?? 0,
              currency: ssa.currency ?? "TRY",
              payGrade: ssa.salary_structure ?? "",
              effectiveFrom: ssa.effective_from ?? null
            } : hasManualSalary
              ? {
                name: `EMP-${emp.name}`,
                employee: emp.name,
                employee_name: emp.employee_name ?? emp.name,
                baseSalary: manualAmount,
                currency: manualSalary?.salary_currency ?? "TRY",
                payGrade: "Manuel Tanim",
                effectiveFrom: null
              }
              : null,
            benefits: []
          };
        });

        if (!cancelled) {
          setEmployees(employeeSalaries);
          if (employeeSalaries.length > 0 && !selectedEmployee) {
            setSelectedEmployee(employeeSalaries[0].employeeId);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Maaş verileri alinamadi.");
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
  }, []);

  const selected = employees.find(e => e.employeeId === selectedEmployee);

  function formatCurrency(amount: number, currency: string = "TRY"): string {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency
    }).format(amount);
  }

  return (
    <div className="salary-page-stack">
      <section className="screen-card">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Maaş Yonetimi</p>
            <h3>Personel Maas Ozeti</h3>
          </div>
        </div>

        {loading && <p className="salary-page-state">Yukleniyor...</p>}
        {error && <p className="salary-page-state salary-page-state--error">{error}</p>}

        {!loading && !error && employees.length === 0 && (
          <p className="salary-page-state">Personel bulunamadi.</p>
        )}

        {!loading && !error && employees.length > 0 && (
          <>
            <div className="salary-employee-select">
              <label>
                <span>Personel secin</span>
                <select
                  value={selectedEmployee ?? ""}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selected && (
              <div className="salary-detail-grid">
                {selected.salaryInfo ? (
                  <article className="salary-summary-card">
                    <h4>Temel Maas</h4>
                    <p className="salary-main-amount">
                      {formatCurrency(selected.salaryInfo.baseSalary, selected.salaryInfo.currency)}
                      <span>/ay</span>
                    </p>
                    <dl className="salary-info-list">
                      <div>
                        <dt>Ucret Gradi</dt>
                        <dd>{selected.salaryInfo.payGrade || "-"}</dd>
                      </div>
                      <div>
                        <dt>Para Birimi</dt>
                        <dd>{selected.salaryInfo.currency}</dd>
                      </div>
                      <div>
                        <dt>Gecerlilik</dt>
                        <dd>{selected.salaryInfo.effectiveFrom || "-"}</dd>
                      </div>
                    </dl>
                  </article>
                ) : (
                  <article className="salary-summary-card salary-summary-card--empty">
                    <p>Bu personel icin maas kaydi yok.</p>
                  </article>
                )}

                {selected.benefits.length > 0 ? (
                  <article className="salary-benefits-card">
                    <h4>Yan Haklar</h4>
                    {selected.benefits.map(b => (
                      <div key={b.id} className="salary-benefit-item">
                        <span>{b.benefitName}</span>
                        <strong>{formatCurrency(b.amount)}</strong>
                      </div>
                    ))}
                  </article>
                ) : (
                  <article className="salary-benefits-card salary-benefits-card--empty">
                    <p>Yan hak bulunmuyor.</p>
                  </article>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
