import { operationsSnapshot } from "../../features/operations/data/operationsSnapshot";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { TeamScreen } from "../../features/operations/components/TeamScreen";

export function TeamPage() {
  return (
    <div className="operations-page">
      <SectionIntro
        chip="Standalone route"
        description="Ekipler kendi ekraninda vardiya, lider ve uzmanlik bilgisiyle goruntulenir."
        eyebrow="Ekip listesi"
        title="Vardiya ve uzmanlik dagilimi"
      />
      <TeamScreen teams={operationsSnapshot.teamItems} />
    </div>
  );
}
