import { operationsSnapshot } from "../../features/operations/data/operationsSnapshot";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { FieldReportScreen } from "../../features/operations/components/FieldReportScreen";

export function FieldReportPage() {
  return (
    <div className="operations-page">
      <SectionIntro
        chip="Standalone route"
        description="Saha bildirimi formu fotograf ve konum destekli mobil akista ayrik olarak acilir."
        eyebrow="Saha bildirimi"
        title="Mobil sorun kaydi formu"
      />
      <FieldReportScreen reports={operationsSnapshot.fieldReports} />
    </div>
  );
}
