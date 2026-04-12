import { operationsSnapshot } from "../../features/operations/data/operationsSnapshot";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { ZimmetScreen } from "../../features/operations/components/ZimmetScreen";

export function ZimmetPage() {
  return (
    <div className="operations-page">
      <SectionIntro
        chip="Standalone route"
        description="Zimmet akisi teslim ve iade surecini tek URL altinda toplar."
        eyebrow="Zimmet akisi"
        title="Teslim ve iade takibi"
      />
      <ZimmetScreen items={operationsSnapshot.zimmetItems} />
    </div>
  );
}
