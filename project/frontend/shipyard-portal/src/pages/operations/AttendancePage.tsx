import { operationsSnapshot } from "../../features/operations/data/operationsSnapshot";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { AttendanceScreen } from "../../features/operations/components/AttendanceScreen";

export function AttendancePage() {
  return (
    <div className="operations-page">
      <SectionIntro
        chip="Standalone route"
        description="Attendance ekranı giris-cikis ve formen onayi icin sade mobil arayuz saglar."
        eyebrow="Attendance kullanimi"
        title="Bugunku vardiya paneli"
      />
      <AttendanceScreen items={operationsSnapshot.attendanceItems} />
    </div>
  );
}
