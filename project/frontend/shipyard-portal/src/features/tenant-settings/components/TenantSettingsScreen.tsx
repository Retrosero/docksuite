import { useEffect, useState } from "react";
import { fetchLeaveTypeSettings, saveLeaveTypeSettings } from "../services/tenantSettingsService";
import { translateLeaveTypeLabel } from "../../leave/services/leaveTrackingService";

function parseLeaveTypeLines(text: string) {
  return text
    .split(/[\r\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function TenantSettingsScreen() {
  const [leaveTypesText, setLeaveTypesText] = useState("");
  const [initialLeaveTypesText, setInitialLeaveTypesText] = useState("");
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
        const response = await fetchLeaveTypeSettings();
        if (!cancelled) {
          setLeaveTypesText(response.leaveTypesText);
          setInitialLeaveTypesText(response.leaveTypesText);
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

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await saveLeaveTypeSettings(leaveTypesText);
      const normalizedText = response.leaveTypesText;
      setLeaveTypesText(normalizedText);
      setInitialLeaveTypesText(normalizedText);
      setSuccess("Izin turleri kaydedildi ve ERPNext Leave Type kayitlari guncellendi.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Izin turleri kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setLeaveTypesText(initialLeaveTypesText);
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
            <p className="leave-empty-state">Henüz izin turu tanimlanmadi.</p>
          )}
        </div>

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
