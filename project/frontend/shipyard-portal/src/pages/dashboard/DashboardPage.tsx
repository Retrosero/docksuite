import { DashboardMetricGrid } from "../../features/dashboard/components/DashboardMetricGrid";
import { DashboardQuickActions } from "../../features/dashboard/components/DashboardQuickActions";
import { DashboardSummaryPanels } from "../../features/dashboard/components/DashboardSummaryPanels";
import { DashboardTopBar } from "../../features/dashboard/components/DashboardTopBar";
import { useDashboardData } from "../../features/dashboard/hooks/useDashboardData";

export function DashboardPage() {
  const { data, loading, error, refresh } = useDashboardData();

  return (
    <div className="dashboard-main">
      <DashboardTopBar data={data} loading={loading} onRefresh={refresh} />

      {error ? <p className="dashboard-state dashboard-state--error">{error}</p> : null}

      {loading && !data ? <p className="dashboard-state">Dashboard yukleniyor...</p> : null}

      {data ? (
        <>
          <DashboardMetricGrid metrics={data.metrics} />
          <DashboardQuickActions />
          <DashboardSummaryPanels
            activities={data.activities}
            criticalStockTotal={data.criticalStockTotal}
            criticalStocks={data.criticalStocks}
            openTaskTotal={data.openTaskTotal}
            openTasks={data.openTasks}
            shiftOverview={data.shiftOverview}
          />
        </>
      ) : null}
    </div>
  );
}
