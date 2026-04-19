import { useEffect, useState } from "react";
import {
  fetchLeaveTypeSettings,
  fetchOperationalSettings,
  saveLeaveTypeSettings,
  saveOperationalSettings,
  type OperationalSettingsState
} from "../services/tenantSettingsService";
import { translateLeaveTypeLabel } from "../../leave/services/leaveTrackingService";

function parseLeaveTypeLines(text: string) {
  return text
    .split(/[\r\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const DEFAULT_OPERATIONAL_SETTINGS: OperationalSettingsState = {
  overtimeDefaultHours: 2,
  attendanceLookbackDays: 30,
  dashboardCriticalStockLimit: 5,
  purchaseInvoicePageSize: 20,
  stockListPageSize: 250,
  teamListPageSize: 250,
  zimmetListPageSize: 250,
  payrollStandardMonthlyHours: 225
};

export function TenantSettingsScreen() {
  const [leaveTypesText, setLeaveTypesText] = useState("");
  const [initialLeaveTypesText, setInitialLeaveTypesText] = useState("");
  const [departmentsText, setDepartmentsText] = useState("");
  const [initialDepartmentsText, setInitialDepartmentsText] = useState("");
  const [autoCreateLeaveAllocation, setAutoCreateLeaveAllocation] = useState(false);
  const [initialAutoCreateLeaveAllocation, setInitialAutoCreateLeaveAllocation] = useState(false);
  const [defaultLeaveAllocationDays, setDefaultLeaveAllocationDays] = useState(14);
  const [initialDefaultLeaveAllocationDays, setInitialDefaultLeaveAllocationDays] = useState(14);
  const [operationalSettings, setOperationalSettings] = useState<OperationalSettingsState>(DEFAULT_OPERATIONAL_SETTINGS);
  const [initialOperationalSettings, setInitialOperationalSettings] =
    useState<OperationalSettingsState>(DEFAULT_OPERATIONAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [leaveTypeResponse, operationalResponse] = await Promise.all([
          fetchLeaveTypeSettings(),
          fetchOperationalSettings()
        ]);
        if (!cancelled) {
          setLeaveTypesText(leaveTypeResponse.leaveTypesText);
          setInitialLeaveTypesText(leaveTypeResponse.leaveTypesText);
          setDepartmentsText(leaveTypeResponse.departmentsText);
          setInitialDepartmentsText(leaveTypeResponse.departmentsText);
          setAutoCreateLeaveAllocation(leaveTypeResponse.autoCreateLeaveAllocation);
          setInitialAutoCreateLeaveAllocation(leaveTypeResponse.autoCreateLeaveAllocation);
          setDefaultLeaveAllocationDays(leaveTypeResponse.defaultLeaveAllocationDays);
          setInitialDefaultLeaveAllocationDays(leaveTypeResponse.defaultLeaveAllocationDays);
          setOperationalSettings(operationalResponse);
          setInitialOperationalSettings(operationalResponse);
        }
      } catch {
        if (!cancelled) {
          setError("Ayarlar yuklenemedi.");
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

  const parsedLeaveTypes = parseLeaveTypeLines(leaveTypesText);
  const parsedDepartments = parseLeaveTypeLines(departmentsText);
  const allocationPolicy = autoCreateLeaveAllocation ? "auto" : "manual";

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const leaveTypeResponse = await saveLeaveTypeSettings(
        leaveTypesText,
        departmentsText,
        autoCreateLeaveAllocation,
        defaultLeaveAllocationDays
      );
      const operationalResponse = await saveOperationalSettings(operationalSettings);
      const normalizedText = leaveTypeResponse.leaveTypesText;
      setLeaveTypesText(normalizedText);
      setInitialLeaveTypesText(normalizedText);
      setDepartmentsText(leaveTypeResponse.departmentsText);
      setInitialDepartmentsText(leaveTypeResponse.departmentsText);
      setAutoCreateLeaveAllocation(leaveTypeResponse.autoCreateLeaveAllocation);
      setInitialAutoCreateLeaveAllocation(leaveTypeResponse.autoCreateLeaveAllocation);
      setDefaultLeaveAllocationDays(leaveTypeResponse.defaultLeaveAllocationDays);
      setInitialDefaultLeaveAllocationDays(leaveTypeResponse.defaultLeaveAllocationDays);
      setOperationalSettings(operationalResponse);
      setInitialOperationalSettings(operationalResponse);
      setSuccess("Ayarlar kaydedildi ve ERPNext tenant ayarlari guncellendi.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Izin turleri kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setLeaveTypesText(initialLeaveTypesText);
    setDepartmentsText(initialDepartmentsText);
    setAutoCreateLeaveAllocation(initialAutoCreateLeaveAllocation);
    setDefaultLeaveAllocationDays(initialDefaultLeaveAllocationDays);
    setOperationalSettings(initialOperationalSettings);
    setSuccess(null);
    setError(null);
  }

  return (
    <div className="user-access-stack">
      <section className="screen-card user-access-card">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Ayarlar</p>
            <h3>Izin Turleri</h3>
          </div>
          <button className="btn btn--secondary" type="button" onClick={handleReset} disabled={loading || saving}>
            Sifirla
          </button>
        </div>

        <p className="leave-mode-note">
          Her satira bir izin turu adi yazin. Kaydedince bu degerler ERPNext Leave Type kayitlari olarak olusturulur
          veya guncellenir.
        </p>

        {loading ? <p className="leave-empty-state">Ayarlar yukleniyor...</p> : null}
        {error ? <p className="user-access-message user-access-message--error">{error}</p> : null}
        {success ? <p className="user-access-message user-access-message--success">{success}</p> : null}

        <div className="form-group form-group--full">
          <label htmlFor="leaveTypesText">Izin turu listesi</label>
          <textarea
            id="leaveTypesText"
            value={leaveTypesText}
            onChange={(event) => setLeaveTypesText(event.target.value)}
            placeholder={"Yillik Izin\nMazeret Izni\nHastalik Izni"}
            rows={8}
            disabled={loading || saving}
          />
        </div>

        <div className="form-group form-group--full">
          <label htmlFor="departmentsText">Departman listesi</label>
          <textarea
            id="departmentsText"
            value={departmentsText}
            onChange={(event) => setDepartmentsText(event.target.value)}
            placeholder={"Uretim\nMuhendislik\nDepo"}
            rows={6}
            disabled={loading || saving}
          />
          <p className="form-hint">
            Her satira bir departman yazin. Kaydet ile ERPNext Department kayitlari eksikse otomatik olusturulur.
          </p>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="allocationPolicy">Izin Tahsis Davranisi</label>
            <select
              id="allocationPolicy"
              value={allocationPolicy}
              onChange={(event) => setAutoCreateLeaveAllocation(event.target.value === "auto")}
              disabled={loading || saving}
            >
              <option value="manual">Manuel zorunlu (tahsis yoksa engelle)</option>
              <option value="auto">Otomatik olustur (tahsis yoksa olustur)</option>
            </select>
            <p className="form-hint">
              Bu ayar, Yeni Izin Basvurusu ekraninda aktif tahsis bulunamadiginda sistemin nasil davranacagini belirler.
            </p>
          </div>

          <div className="form-group form-group--checkbox">
            <label htmlFor="autoCreateLeaveAllocation">
              <input
                id="autoCreateLeaveAllocation"
                type="checkbox"
                checked={autoCreateLeaveAllocation}
                onChange={(event) => setAutoCreateLeaveAllocation(event.target.checked)}
                disabled={loading || saving}
              />
              Izin tahsisini otomatik olustur
            </label>
            <p className="form-hint">
              Aktifse, personel + izin turu icin tahsis yoksa basvuru sirasinda sistem otomatik Leave Allocation olusturur.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="defaultLeaveAllocationDays">Varsayilan tahsis gunu</label>
            <input
              id="defaultLeaveAllocationDays"
              type="number"
              min={1}
              step={1}
              value={defaultLeaveAllocationDays}
              onChange={(event) => setDefaultLeaveAllocationDays(Math.max(1, Number(event.target.value) || 1))}
              disabled={loading || saving || !autoCreateLeaveAllocation}
            />
            <p className="form-hint">
              Otomatik mod aciksa, yeni olusturulan Leave Allocation bu gun degeriyle acilir.
            </p>
          </div>
        </div>

        <div className="tenant-settings-preview">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Onizleme</p>
              <h4>{parsedLeaveTypes.length} izin turu</h4>
            </div>
          </div>

          {parsedLeaveTypes.length > 0 ? (
            <div className="screen-chip-list">
              {parsedLeaveTypes.map((leaveType) => (
                <span className="screen-chip" key={leaveType}>
                  {translateLeaveTypeLabel(leaveType)}
                </span>
              ))}
            </div>
          ) : (
            <p className="leave-empty-state">Henuz izin turu tanimlanmadi.</p>
          )}
        </div>

        <div className="tenant-settings-preview">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Departmanlar</p>
              <h4>{parsedDepartments.length} departman</h4>
            </div>
          </div>

          {parsedDepartments.length > 0 ? (
            <div className="screen-chip-list">
              {parsedDepartments.map((department) => (
                <span className="screen-chip" key={department}>
                  {department}
                </span>
              ))}
            </div>
          ) : (
            <p className="leave-empty-state">Henuz departman tanimlanmadi.</p>
          )}
        </div>

        <section className="screen-card user-access-card">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Operasyon Ayarlari</p>
              <h3>Modul Varsayilanlari</h3>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="overtimeDefaultHours">Varsayilan Mesai Saati</label>
              <input
                id="overtimeDefaultHours"
                type="number"
                min={0.5}
                max={24}
                step={0.5}
                value={operationalSettings.overtimeDefaultHours}
                onChange={(event) =>
                  setOperationalSettings((previous) => ({
                    ...previous,
                    overtimeDefaultHours: Math.min(24, Math.max(0.5, Number(event.target.value) || 0.5))
                  }))
                }
                disabled={loading || saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="attendanceLookbackDays">Vardiya Gecmis Gun Sayisi</label>
              <input
                id="attendanceLookbackDays"
                type="number"
                min={1}
                max={180}
                step={1}
                value={operationalSettings.attendanceLookbackDays}
                onChange={(event) =>
                  setOperationalSettings((previous) => ({
                    ...previous,
                    attendanceLookbackDays: Math.min(180, Math.max(1, Number(event.target.value) || 1))
                  }))
                }
                disabled={loading || saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dashboardCriticalStockLimit">Dashboard Kritik Stok Limiti</label>
              <input
                id="dashboardCriticalStockLimit"
                type="number"
                min={1}
                max={50}
                step={1}
                value={operationalSettings.dashboardCriticalStockLimit}
                onChange={(event) =>
                  setOperationalSettings((previous) => ({
                    ...previous,
                    dashboardCriticalStockLimit: Math.min(50, Math.max(1, Number(event.target.value) || 1))
                  }))
                }
                disabled={loading || saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="purchaseInvoicePageSize">Alis Fatura Sayfa Boyutu</label>
              <input
                id="purchaseInvoicePageSize"
                type="number"
                min={10}
                max={200}
                step={1}
                value={operationalSettings.purchaseInvoicePageSize}
                onChange={(event) =>
                  setOperationalSettings((previous) => ({
                    ...previous,
                    purchaseInvoicePageSize: Math.min(200, Math.max(10, Number(event.target.value) || 10))
                  }))
                }
                disabled={loading || saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="stockListPageSize">Stok Liste Sayfa Boyutu</label>
              <input
                id="stockListPageSize"
                type="number"
                min={50}
                max={1000}
                step={10}
                value={operationalSettings.stockListPageSize}
                onChange={(event) =>
                  setOperationalSettings((previous) => ({
                    ...previous,
                    stockListPageSize: Math.min(1000, Math.max(50, Number(event.target.value) || 50))
                  }))
                }
                disabled={loading || saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="teamListPageSize">Ekip Liste Sayfa Boyutu</label>
              <input
                id="teamListPageSize"
                type="number"
                min={50}
                max={1000}
                step={10}
                value={operationalSettings.teamListPageSize}
                onChange={(event) =>
                  setOperationalSettings((previous) => ({
                    ...previous,
                    teamListPageSize: Math.min(1000, Math.max(50, Number(event.target.value) || 50))
                  }))
                }
                disabled={loading || saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="zimmetListPageSize">Zimmet Liste Sayfa Boyutu</label>
              <input
                id="zimmetListPageSize"
                type="number"
                min={50}
                max={1000}
                step={10}
                value={operationalSettings.zimmetListPageSize}
                onChange={(event) =>
                  setOperationalSettings((previous) => ({
                    ...previous,
                    zimmetListPageSize: Math.min(1000, Math.max(50, Number(event.target.value) || 50))
                  }))
                }
                disabled={loading || saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="payrollStandardMonthlyHours">Bordro Aylik Standart Saat</label>
              <input
                id="payrollStandardMonthlyHours"
                type="number"
                min={120}
                max={400}
                step={1}
                value={operationalSettings.payrollStandardMonthlyHours}
                onChange={(event) =>
                  setOperationalSettings((previous) => ({
                    ...previous,
                    payrollStandardMonthlyHours: Math.min(400, Math.max(120, Number(event.target.value) || 120))
                  }))
                }
                disabled={loading || saving}
              />
            </div>
          </div>

          <div className="tenant-settings-preview">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Ayarlar Kapsami</p>
                <h4>Modul Bazli Durum</h4>
              </div>
            </div>
            <div className="screen-chip-list">
              <span className="screen-chip">Izin: tur + tahsis ayari</span>
              <span className="screen-chip">Mesai: varsayilan saat</span>
              <span className="screen-chip">Vardiya: gecmis gun penceresi</span>
              <span className="screen-chip">Dashboard: kritik stok limiti</span>
              <span className="screen-chip">Alis Fatura: sayfa boyutu</span>
              <span className="screen-chip">Stok: sayfa boyutu</span>
              <span className="screen-chip">Ekip: sayfa boyutu</span>
              <span className="screen-chip">Zimmet: sayfa boyutu</span>
              <span className="screen-chip">Bordro: aylik standart saat</span>
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button className="btn btn--secondary" type="button" onClick={handleReset} disabled={loading || saving}>
            Iptal
          </button>
          <button className="btn btn--primary" type="button" onClick={() => void handleSave()} disabled={loading || saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </section>
    </div>
  );
}
