import { LeaveTrackingScreen } from "../../features/leave/components/LeaveTrackingScreen";
import { SectionIntro } from "../../features/operations/components/SectionIntro";

export function LeaveTrackingPage() {
  return (
    <div className="operations-page">
      <SectionIntro
        chip="Leave Application + Leave Allocation"
        description="Calisan izin talepleri, yonetici onay akisi ve kalan izin ozeti tek ekranda sade bir yapida sunulur."
        eyebrow="Izin takibi"
        title="Izin Takibi"
      />
      <LeaveTrackingScreen />
    </div>
  );
}
