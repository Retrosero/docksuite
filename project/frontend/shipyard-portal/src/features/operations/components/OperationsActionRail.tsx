import type { OperationAction } from "../types";

type OperationsActionRailProps = {
  actions: OperationAction[];
};

export function OperationsActionRail({ actions }: OperationsActionRailProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Ilk ekranlar</p>
          <h3>Operasyon kisa yollar</h3>
        </div>
      </div>
      <div className="action-grid">
        {actions.map((action) => (
          <article className={`action-card action-card--${action.tone}`} key={action.title}>
            <div>
              <h4>{action.title}</h4>
              <p>{action.description}</p>
            </div>
            <button type="button">{action.cta}</button>
          </article>
        ))}
      </div>
    </section>
  );
}
