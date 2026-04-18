import { useMemo, useState } from "react";
import type { ShiftAssignment } from "../types";
import type { LeaveCalendarEntry } from "../../leave/types";

type ShiftPlanningCalendarProps = {
  rows: Array<ShiftAssignment & { shiftLabel?: string }>;
  leaveEntries: LeaveCalendarEntry[];
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

type CalendarDayEntry = {
  id: string;
  kind: "shift" | "leave";
  employeeId: string;
  employeeName: string;
  label: string;
  status: string;
  detailLabel: string;
};

type CalendarDayBucket = {
  shifts: CalendarDayEntry[];
  leaves: CalendarDayEntry[];
};

export function ShiftPlanningCalendar({
  rows,
  leaveEntries,
  onCreateAtDate,
  onDeleteAssignment,
  deletingAssignmentId
}: ShiftPlanningCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
    const map = new Map<string, CalendarDayBucket>();
    for (const row of rows) {
      const start = parseDate(row.start_date);
      const end = parseDate(row.end_date || row.start_date);
      if (!start || !end) continue;

      const from = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const to = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const key = toDateOnly(d);
        const existing = map.get(key) ?? { shifts: [], leaves: [] };
        existing.shifts.push({
          id: row.name,
          kind: "shift",
          employeeId: row.employee,
          employeeName: row.employee_name || row.employee || "-",
          label: row.shiftLabel ?? row.shift_type ?? "-",
          status: row.status || "Aktif",
          detailLabel: row.shiftLabel ?? row.shift_type ?? "-"
        });
        map.set(key, existing);
      }
    }

    for (const leave of leaveEntries) {
      const start = parseDate(leave.fromDate);
      const end = parseDate(leave.toDate || leave.fromDate);
      if (!start || !end) continue;

      const from = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const to = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const key = toDateOnly(d);
        const existing = map.get(key) ?? { shifts: [], leaves: [] };
        existing.leaves.push({
          id: leave.id,
          kind: "leave",
          employeeId: leave.employeeId,
          employeeName: leave.employeeName,
          label: leave.leaveType,
          status: leave.statusLabel,
          detailLabel: leave.leaveType
        });
        map.set(key, existing);
      }
    }
    return map;
  }, [leaveEntries, rows]);

  const monthIndex = cursor.getMonth();
  const year = cursor.getFullYear();
  const selectedBucket = selectedDate ? eventMap.get(selectedDate) ?? { shifts: [], leaves: [] } : { shifts: [], leaves: [] };
  const selectedDateValue = selectedDate ? parseDate(selectedDate) : null;
  const selectedDateLabel = selectedDateValue
    ? new Intl.DateTimeFormat("tr-TR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(selectedDateValue)
    : "";

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
          const bucket = eventMap.get(key) ?? { shifts: [], leaves: [] };
          const inMonth = date.getMonth() === monthIndex;
          const workingCount = bucket.shifts.length;
          const leaveCount = bucket.leaves.length;

          return (
            <button
              key={key}
              type="button"
              className={`shift-calendar-day${inMonth ? "" : " is-outside"}${workingCount > 0 || leaveCount > 0 ? " has-events" : ""}`}
              onClick={() => setSelectedDate(key)}
            >
              <div className="shift-calendar-day__top">
                <span>{date.getDate()}</span>
                {workingCount > 0 || leaveCount > 0 ? <strong>{workingCount + leaveCount}</strong> : null}
              </div>

              <div className="shift-calendar-day__events">
                {workingCount === 0 && leaveCount === 0 ? (
                  <span className="shift-calendar-day__empty">Bos gun</span>
                ) : (
                  <>
                    <span className="shift-calendar-day__summary">{workingCount} personel</span>
                    {leaveCount > 0 ? <span className="shift-calendar-day__summary shift-calendar-day__summary--leave">{leaveCount} izinli</span> : null}
                  </>
                )}
              </div>

              <span className="shift-calendar-day__add">Detay icin tikla</span>
            </button>
          );
        })}
      </div>

      {selectedDate ? (
        <div
          className="shift-calendar-detail-overlay"
          onClick={() => setSelectedDate(null)}
          role="presentation"
        >
          <div className="shift-calendar-detail-modal" onClick={(event) => event.stopPropagation()}>
            <header className="shift-calendar-detail-modal__header">
              <div>
                <p className="eyebrow">Gun detayi</p>
                <h3>{selectedDateLabel}</h3>
              </div>
              <button
                type="button"
                className="shift-calendar-detail-modal__close"
                onClick={() => setSelectedDate(null)}
                aria-label="Kapat"
              >
                x
              </button>
            </header>

            <div className="shift-calendar-detail-modal__body">
              {selectedBucket.shifts.length === 0 && selectedBucket.leaves.length === 0 ? (
                <p className="shift-plan-empty-state">Bu tarihte vardiya atamasi yok.</p>
              ) : (
                <div className="shift-calendar-detail-list">
                  {selectedBucket.shifts.length > 0 ? <h4 className="shift-calendar-detail-section-title">Calisanlar</h4> : null}
                  {selectedBucket.shifts.map((event) => {
                    const isDeleting = deletingAssignmentId === event.id;

                    return (
                      <article className="shift-calendar-detail-item" key={event.id}>
                        <div className="shift-calendar-detail-item__copy">
                          <strong>{event.employeeName}</strong>
                          <span>{event.detailLabel}</span>
                          <p>{event.status}</p>
                        </div>
                        <button
                          className="shift-plan-row-action shift-calendar-detail-item__delete"
                          disabled={isDeleting}
                          onClick={() => onDeleteAssignment(event.id)}
                          type="button"
                        >
                          {isDeleting ? "Kaldiriliyor..." : "Kaldir"}
                        </button>
                      </article>
                    );
                  })}

                  {selectedBucket.leaves.length > 0 ? <h4 className="shift-calendar-detail-section-title">Izinliler</h4> : null}
                  {selectedBucket.leaves.map((event) => (
                    <article className="shift-calendar-detail-item shift-calendar-detail-item--leave" key={event.id}>
                      <div className="shift-calendar-detail-item__copy">
                        <strong>{event.employeeName}</strong>
                        <span>{event.detailLabel}</span>
                        <p>{event.status}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <footer className="shift-calendar-detail-modal__footer">
              <button type="button" className="btn btn--secondary" onClick={() => setSelectedDate(null)}>
                Kapat
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  if (!selectedDate) {
                    return;
                  }
                  onCreateAtDate(selectedDate);
                  setSelectedDate(null);
                }}
              >
                Bu tarihe atama ekle
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
