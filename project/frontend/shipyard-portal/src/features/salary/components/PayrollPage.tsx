import { useEffect, useState } from "react";
import { calculatePayrollForEmployee, getOvertimeRateDescription } from "../services/payrollService";
import { fetchActiveEmployeeOptions } from "../services/salaryService";
import type { PayrollCalculation, PayrollPeriod } from "../types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY"
  }).format(amount);
}

export function PayrollPage() {
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [period, setPeriod] = useState<PayrollPeriod>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      label: new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(now),
      startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
      endDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, "0")}`
    };
  });
  const [calculation, setCalculation] = useState<PayrollCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees on mount
  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      try {
        const rows = await fetchActiveEmployeeOptions();

        if (!cancelled) {
          setEmployees(rows);
          if (rows.length > 0 && !selectedEmployee) {
            setSelectedEmployee(rows[0].id);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Personeller yuklenemedi.");
        }
      }
    }

    void loadEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCalculate() {
    if (!selectedEmployee) {
      setError("Lutfen once personel secin.");
      return;
    }

    setCalculating(true);
    setError(null);
    setCalculation(null);

    try {
      const result = await calculatePayrollForEmployee(selectedEmployee, period.year, period.month);
      setCalculation(result);
    } catch {
      setError("Bordro hesaplanamadi.");
    } finally {
      setCalculating(false);
    }
  }

  function handlePeriodChange(year: number, month: number) {
    const date = new Date(year, month - 1, 1);
    const label = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(date);
    setPeriod({
      year,
      month,
      label,
      startDate: `${year}-${String(month).padStart(2, "0")}-01`,
      endDate: `${year}-${String(month).padStart(2, "0")}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`
    });
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="payroll-page-stack">
      <section className="screen-card">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Bordro Hesaplama</p>
            <h3>Aylik Maas Hesaplama</h3>
          </div>
        </div>

        <div className="payroll-controls">
          <label className="payroll-control">
            <span>Personel</span>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Personel secin</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </label>

          <label className="payroll-control">
            <span>Donem</span>
            <div className="payroll-period-inputs">
              <select
                value={period.year}
                onChange={(e) => handlePeriodChange(parseInt(e.target.value), period.month)}
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={period.month}
                onChange={(e) => handlePeriodChange(period.year, parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Intl.DateTimeFormat("tr-TR", { month: "long" }).format(new Date(2024, m - 1))}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <button
            className="btn btn--primary payroll-calculate-btn"
            disabled={calculating || !selectedEmployee}
            onClick={() => void handleCalculate()}
          >
            {calculating ? "Hesaplaniyor..." : "Hesapla"}
          </button>
        </div>

        <p className="payroll-rate-info">
          <strong>Mesai carpanlari:</strong> {getOvertimeRateDescription()}
        </p>

        {error && <p className="payroll-error">{error}</p>}

        {calculation && (
          <div className="payroll-result">
            <div className="payroll-result-header">
              <h4>{calculation.period.label} - Bordro Ozeti</h4>
            </div>

            <div className="payroll-breakdown">
              <section className="payroll-section">
                <h5>Calisma Bilgileri</h5>
                <dl className="payroll-dl">
                  <div>
                    <dt>Calisilan Gun</dt>
                    <dd>{calculation.attendanceDays} gun</dd>
                  </div>
                  <div>
                    <dt>Toplam Calisma Saati</dt>
                    <dd>{calculation.regularHoursWorked.toFixed(1)} saat</dd>
                  </div>
                </dl>
              </section>

              <section className="payroll-section">
                <h5>Mesai Bilgileri</h5>
                <dl className="payroll-dl">
                  <div>
                    <dt>Hafta ici mesai</dt>
                    <dd>{calculation.overtimeWeekdayHours.toFixed(1)} saat ({calculation.overtimeWeekdayRate}x)</dd>
                  </div>
                  <div>
                    <dt>Hafta sonu mesai</dt>
                    <dd>{calculation.overtimeWeekendHours.toFixed(1)} saat ({calculation.overtimeWeekendRate}x)</dd>
                  </div>
                  <div>
                    <dt>Toplam Mesai Odegi</dt>
                    <dd className="payroll-pay-amount">{formatCurrency(calculation.totalOvertimePay)}</dd>
                  </div>
                </dl>
              </section>

              <section className="payroll-section payroll-section--main">
                <h5>Maas Ozeti</h5>
                <dl className="payroll-dl payroll-dl--large">
                  <div>
                    <dt>Temel Maas</dt>
                    <dd>{formatCurrency(calculation.baseSalary)}</dd>
                  </div>
                  <div>
                    <dt>Mesai Odegi</dt>
                    <dd className="text-warning">{formatCurrency(calculation.totalOvertimePay)}</dd>
                  </div>
                  <div className="payroll-total-row">
                    <dt>Toplam Kazanc</dt>
                    <dd className="payroll-total">{formatCurrency(calculation.totalEarnings)}</dd>
                  </div>
                  <div>
                    <dt>Kesintiler</dt>
                    <dd>{formatCurrency(calculation.totalDeductions)}</dd>
                  </div>
                  <div className="payroll-net-row">
                    <dt>Net Maas</dt>
                    <dd className="payroll-net">{formatCurrency(calculation.netSalary)}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
