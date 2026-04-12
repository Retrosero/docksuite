import type { TaskItem } from "../types";

type TaskScreenProps = {
  tasks: TaskItem[];
};

export function TaskScreen({ tasks }: TaskScreenProps) {
  return (
    <section className="screen-card">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Gorev listesi</p>
          <h3>Bugunun operasyon sirasi</h3>
        </div>
        <span className="screen-chip">Standart Task akisi</span>
      </div>
      <div className="screen-stack">
        {tasks.map((task) => (
          <article className="screen-row" key={task.title}>
            <div className="screen-row__main">
              <div className="screen-row__heading">
                <h4>{task.title}</h4>
                <span className={`priority priority--${task.priority.toLowerCase()}`}>{task.priority}</span>
              </div>
              <p>
                {task.team} ekip - {task.assignee}
              </p>
            </div>
            <div className="screen-row__meta">
              <strong>{task.status}</strong>
              <span>{task.dueLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
