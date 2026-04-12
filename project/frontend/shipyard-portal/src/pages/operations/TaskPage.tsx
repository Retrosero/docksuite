import { operationsSnapshot } from "../../features/operations/data/operationsSnapshot";
import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { TaskScreen } from "../../features/operations/components/TaskScreen";

export function TaskPage() {
  return (
    <div className="operations-page">
      <SectionIntro
        chip="Standalone route"
        description="Gorev listesi artik kendi URL'si olan ayrik bir operasyon ekraninda aciliyor."
        eyebrow="Gorev listesi"
        title="Bugunun operasyon sirasi"
      />
      <TaskScreen tasks={operationsSnapshot.taskItems} />
    </div>
  );
}
