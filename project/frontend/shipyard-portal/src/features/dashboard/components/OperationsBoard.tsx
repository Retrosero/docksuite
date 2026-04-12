import type { ModuleCard } from "../types";

type OperationsBoardProps = {
  modules: ModuleCard[];
};

export function OperationsBoard({ modules }: OperationsBoardProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Hizli erisim</p>
          <h3>Operasyon modulleri</h3>
        </div>
      </div>
      <div className="module-grid">
        {modules.map((module) => (
          <article className={`module-card module-card--${module.tone}`} key={module.title}>
            <div>
              <h4>{module.title}</h4>
              <p>{module.description}</p>
            </div>
            <strong>{module.metric}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
