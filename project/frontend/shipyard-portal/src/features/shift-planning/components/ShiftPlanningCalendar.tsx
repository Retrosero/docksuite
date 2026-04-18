import { useMemo, useState } from "react";
import type { ShiftAssignment } from "../types";

type ShiftPlanningCalendarProps = {
  rows: Array<ShiftAssignment & { shiftLabel?: string }>;
  onCreateAtDate: (dateIso: string) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  deletingAssignmentId: string | null;
};

const WEEKDAY_LABELS = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];

function toDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(value);
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ShiftPlanningCalendar({ rows, onCreateAtDate, onDeleteAssignment, deletingAssignmentId }: ShiftPlanningCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthCells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const firstWeekDay = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - firstWeekDay);

    const cells: Date[] = [];
    for (let i = 0; i < 42; i += 1) {
      const current = new Date(gridStart);
      current.setDate(gridStart.getDate() + i);
      cells.push(current);
    }
    return cells;
  }, [cursor]);

  const eventMap = useMemo(() => {
    const map = new Map<string, Array<ShiftAssignment & { shiftLabel?: string }>>();
    for (const row of rows) {
      const start = parseDate(row.start_date);
      const end = parseDate(row.end_date || row.start_date);
      if (!start || !end) continue;

      const from = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const to = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const key = toDateOnly(d);
        const existing = map.get(key) ?? [];
        existing.push(row);
        map.set(key, existing);
      }
    }
    return map;
  }, [rows]);

  const monthIndex = cursor.getMonth();
  const year = cursor.getFullYear();

  return (
    <section className="screen-card shift-plan-panel shift-calendar-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Takvim Gorunumu</p>
          <h3>Vardiya Takvimi</h3>
        </div>
        <div className="shift-calendar-nav">
          <button type="button" onClick={() => setCursor(new Date(year, monthIndex - 1, 1))}>
            Onceki
          </button>
          <strong>{formatMonthLabel(cursor)}</strong>
          <button type="button" onClick={() => setCursor(new Date(year, monthIndex + 1, 1))}>
            Sonraki
          </button>
        </div>
      </div>

      <div className="shift-calendar-grid" role="grid" aria-label="Vardiya takvimi">
        {WEEKDAY_LABELS.map((label) => (
          <div className="shift-calendar-grid__weekday" key={label}>
            {label}
          </div>
        ))}

        {monthCells.map((date) => {
          const key = toDateOnly(date);
          const events = eventMap.get(key) ?? [];
          const inMonth = date.getMonth() === monthIndex;

          return (
            <article key={key} className={`shift-calendar-day${inMonth ? "" : " is-outside"}${events.length > 0 ? " has-events" : ""}`}>
              <div className="shift-calendar-day__top">
                <span>{date.getDate()}</span>
                {events.length > 0 ? <strong>{events.length}</strong> : null}
              </div>

              <div className="shift-calendar-day__events">
                {events.length === 0 ? (
                  <span className="shift-calendar-day__empty">Bos gun</span>
                ) : (
                  events.map((event) => {
                    const isDeleting = deletingAssignmentId === event.name;
                    const label = event.employee_name || event.employee || "-";

                    return (
                      <div className="shift-calendar-day__event" key={event.name}>
                        <div>
                          <strong>{label}</strong>
                          <span>{event.shiftLabel ?? event.shift_type ?? "-"}</span>
                        </div>
                        <button
                          className="shift-calendar-day__remove"
                          disabled={isDeleting}
                          onClick={() => onDeleteAssignment(event.name)}
                          type="button"
                        >
                          {isDeleting ? "..." : "Kaldir"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <button className="shift-calendar-day__add" onClick={() => onCreateAtDate(key)} type="button">
                + Atama ekle
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
