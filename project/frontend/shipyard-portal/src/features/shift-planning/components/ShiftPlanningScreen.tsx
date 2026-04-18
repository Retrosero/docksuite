import { startTransition, useCallback, useEffect, useState } from "react";
import type { ShiftAssignment, ShiftPlanEmployee, ShiftPlanningFilterState, ShiftTypeInfo } from "../types";
import { deleteShiftAssignment, fetchShiftAssignments } from "../services/shiftPlanningService";
import { ShiftAssignmentList } from "./ShiftAssignmentList";
import { ShiftPlanningCalendar } from "./ShiftPlanningCalendar";
import { ShiftPlanningCreateForm } from "./ShiftPlanningCreateForm";
import { ShiftPlanningFilters } from "./ShiftPlanningFilters";
import { ShiftPlanningSummaryCards } from "./ShiftPlanningSummaryCards";
import { ShiftTypeInlineCreate } from "./ShiftTypeInlineCreate";

type ShiftPlanData = {
  assignments: Array<ShiftAssignment & { shiftLabel?: string }>;
  summary: {
    totalAssignments: number;
    activeAssignments: number;
    upcomingAssignments: number;
  };
  shiftTypes: ShiftTypeInfo[];
  employees: ShiftPlanEmployee[];
  dateLabel: string;
};

const INITIAL_FILTERS: ShiftPlanningFilterState = {
  shiftType: "",
  employee: "",
  startDate: "",
  endDate: "",
  searchText: ""
};

export function ShiftPlanningScreen() {
  const [filters, setFilters] = useState<ShiftPlanningFilterState>(INITIAL_FILTERS);
  const [data, setData] = useState<ShiftPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createStartDate, setCreateStartDate] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchShiftAssignments(filters);
        if (!cancelled) {
          setData(result);
        }
      } catch {
        if (!cancelled) {
          setError("Vardiya verisi alinamadi. Lutfen tekrar deneyin.");
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
  }, [filters, refreshToken]);

  const handleFiltersChange = (next: ShiftPlanningFilterState) => {
    startTransition(() => {
      setFilters(next);
    });
  };

  const handleDeleteAssignment = useCallback(
    async (assignmentId: string) => {
      const shouldDelete = window.confirm("Bu vardiya atamasini kaldirmak istiyor musunuz?");
      if (!shouldDelete) {
        return;
      }

      setDeletingAssignmentId(assignmentId);

      try {
        await deleteShiftAssignment(assignmentId);
        refresh();
      } catch {
        window.alert("Vardiya atamasi kaldirilamadi. Lutfen tekrar deneyin.");
      } finally {
        setDeletingAssignmentId(null);
      }
    },
    [refresh]
  );

  return (
    <div className="shift-planning-stack">
      <ShiftPlanningFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        shiftTypes={data?.shiftTypes ?? []}
        employees={data?.employees ?? []}
        loading={loading}
        onRefresh={refresh}
        onCreateNew={() => setShowCreateForm(true)}
      />

      {error ? (
        <p className="shift-plan-empty-state shift-plan-empty-state--error">{error}</p>
      ) : null}

      {loading && !data ? (
        <p className="shift-plan-empty-state">Vardiya verisi yukleniyor...</p>
      ) : null}

      {!loading && !error && data && data.shiftTypes.length === 0 ? (
        <ShiftTypeInlineCreate onCreated={refresh} />
      ) : null}

      {!loading && !error && data ? (
        <>
          <ShiftPlanningSummaryCards summary={data.summary} dateLabel={data.dateLabel} />
          <div className="shift-plan-view-toggle" role="tablist" aria-label="Vardiya plan gorunumu">
            <button
              aria-selected={viewMode === "calendar"}
              className={viewMode === "calendar" ? "is-active" : ""}
              onClick={() => setViewMode("calendar")}
              type="button"
            >
              Takvim
            </button>
            <button
              aria-selected={viewMode === "list"}
              className={viewMode === "list" ? "is-active" : ""}
              onClick={() => setViewMode("list")}
              type="button"
            >
              Liste
            </button>
          </div>
          {viewMode === "calendar" ? (
            <ShiftPlanningCalendar
              rows={data.assignments}
              deletingAssignmentId={deletingAssignmentId}
              onDeleteAssignment={handleDeleteAssignment}
              onCreateAtDate={(dateIso) => {
                setCreateStartDate(dateIso);
                setShowCreateForm(true);
              }}
            />
          ) : null}
          {viewMode === "list" ? (
            <ShiftAssignmentList
              deletingAssignmentId={deletingAssignmentId}
              onDeleteAssignment={handleDeleteAssignment}
              rows={data.assignments}
            />
          ) : null}
        </>
      ) : null}

      {showCreateForm && data ? (
        <ShiftPlanningCreateForm
          shiftTypes={data.shiftTypes}
          employees={data.employees}
          initialStartDate={createStartDate}
          onSuccess={() => {
            setShowCreateForm(false);
            setCreateStartDate(undefined);
            refresh();
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setCreateStartDate(undefined);
          }}
        />
      ) : null}
    </div>
  );
}
