import { ShiftTrackingScreen } from "../../features/attendance/components/ShiftTrackingScreen";
import { SectionIntro } from "../../features/operations/components/SectionIntro";

export function AttendancePage() {
  return (
    <div className="operations-page">
      <SectionIntro
        chip="Shift Type + Attendance"
        description="Bugunku vardiya kayitlari, attendance durumlari ve ekip bazli ozet tek ekranda sade bir akisla goruntulenir."
        eyebrow="Vardiya takibi"
        title="Vardiya Takibi"
      />
      <ShiftTrackingScreen />
    </div>
  );
}
