import { ChevronRight, Users } from "lucide-react";
import type { TeamGroup, TeamMember } from "../types";

type TeamCardListProps = {
  teams: TeamGroup[];
  onItemClick?: (member: TeamMember) => void;
};

function getStatusClass(status: string): string {
  switch (status) {
    case "Aktif":
      return "status--active";
    case "Pasif":
      return "status--passive";
    case "Izinli":
      return "status--on-leave";
    default:
      return "";
  }
}

export function TeamCardList({ teams, onItemClick }: TeamCardListProps) {
  if (teams.length === 0) {
    return (
      <div className="team-empty team-empty--card">
        <p>Ekip bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="team-card-list">
      {teams.map((team) => (
        <article className="team-group-card" key={team.teamName}>
          <header className="team-group-card__header">
            <div className="team-group-card__icon">
              <Users size={18} aria-hidden="true" />
            </div>
            <div className="team-group-card__title">
              <h4>{team.teamName}</h4>
              <span>{team.specialty} • {team.memberCount} üye</span>
            </div>
          </header>

          <div className="team-group-card__members">
            {team.members.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="team-member-row"
                onClick={() => onItemClick?.(member)}
              >
                <div className="team-member-row__avatar">
                  {member.employeeName.charAt(0).toUpperCase()}
                </div>
                <div className="team-member-row__info">
                  <strong>{member.employeeName}</strong>
                  <span>{member.designation}</span>
                </div>
                <span className={`team-status ${getStatusClass(member.status)}`}>
                  {member.status}
                </span>
                <ChevronRight size={14} className="team-member-row__chevron" />
              </div>
            ))}
            {team.members.length > 3 && (
              <p className="team-group-card__more">
                +{team.members.length - 3} daha fazla üye
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
