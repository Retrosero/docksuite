import { operationsSnapshot } from "../../features/operations/data/operationsSnapshot";
import { OperationsActionRail } from "../../features/operations/components/OperationsActionRail";
import { OperationsHero } from "../../features/operations/components/OperationsHero";
import { TaskScreen } from "../../features/operations/components/TaskScreen";
import { TeamScreen } from "../../features/operations/components/TeamScreen";
import { FieldReportScreen } from "../../features/operations/components/FieldReportScreen";
import { ZimmetScreen } from "../../features/operations/components/ZimmetScreen";
import { AttendanceScreen } from "../../features/operations/components/AttendanceScreen";

export function OperationsPage() {
  return (
    <div className="operations-page">
      <OperationsHero snapshot={operationsSnapshot} />
      <OperationsActionRail actions={operationsSnapshot.actions} />
      <div className="operations-page__stack">
        <TaskScreen tasks={operationsSnapshot.taskItems} />
        <TeamScreen teams={operationsSnapshot.teamItems} />
        <FieldReportScreen reports={operationsSnapshot.fieldReports} />
        <ZimmetScreen items={operationsSnapshot.zimmetItems} />
        <AttendanceScreen items={operationsSnapshot.attendanceItems} />
      </div>
    </div>
  );
}
