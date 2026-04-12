import type { TeamItem } from "../types";

type TeamScreenProps = {
  teams: TeamItem[];
};

export function TeamScreen({ teams }: TeamScreenProps) {
  return (
    <section className="screen-card">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Ekip listesi</p>
          <h3>Vardiya ve uzmanlik dagilimi</h3>
        </div>
        <span className="screen-chip">Team DocType</span>
      </div>
      <div className="screen-grid screen-grid--teams">
        {teams.map((team) => (
          <article className="team-card" key={team.name}>
            <div className="team-card__top">
              <h4>{team.name}</h4>
              <span>{team.members} kisi</span>
            </div>
            <p>{team.specialty}</p>
            <dl>
              <div>
                <dt>Formen</dt>
                <dd>{team.lead}</dd>
              </div>
              <div>
                <dt>Vardiya</dt>
                <dd>{team.shift}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
