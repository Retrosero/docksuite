import { useState } from "react";
import { createShiftType } from "../services/shiftPlanningService";

type ShiftTypeInlineCreateProps = {
  onCreated: () => void;
};

const DEFAULT_START = "08:00:00";
const DEFAULT_END = "17:00:00";

export function ShiftTypeInlineCreate({ onCreated }: ShiftTypeInlineCreateProps) {
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState(DEFAULT_START);
  const [endTime, setEndTime] = useState(DEFAULT_END);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedLabel = label.trim();
    const normalizedStart = startTime.trim();
    const normalizedEnd = endTime.trim();

    if (!normalizedLabel || !normalizedStart || !normalizedEnd) {
      setError("Lutfen vardiya tipi adi ve saat alanlarini doldurun.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createShiftType({
        label: normalizedLabel,
        start_time: normalizedStart,
        end_time: normalizedEnd
      });
      setSuccess("Vardiya tipi olusturuldu. Liste yenileniyor.");
      setLabel("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vardiya tipi olusturulamadi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="screen-card shift-plan-panel shift-type-inline-create">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Hizli Kurulum</p>
          <h3>Vardiya tipi ekle</h3>
          <p className="shift-plan-hint">Bu alandan ekledigin vardiya tipi secim listesine otomatik gelir.</p>
        </div>
      </div>

      {error ? <p className="shift-plan-empty-state shift-plan-empty-state--error">{error}</p> : null}
      {success ? <p className="shift-plan-empty-state shift-type-inline-create__success">{success}</p> : null}

      <form className="shift-type-inline-create__form" onSubmit={handleSubmit}>
        <label>
          <span>Vardiya Tipi Adi *</span>
          <input
            type="text"
            placeholder="Ornek: Gunduz"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            maxLength={80}
            required
          />
        </label>

        <label>
          <span>Baslangic Saati *</span>
          <input
            type="time"
            step={1}
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
          />
        </label>

        <label>
          <span>Bitis Saati *</span>
          <input
            type="time"
            step={1}
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            required
          />
        </label>

        <div className="shift-type-inline-create__actions">
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Olusturuluyor..." : "Vardiya Tipi Olustur"}
          </button>
        </div>
      </form>
    </section>
  );
}
