import type { TeamMember } from "../types";

type TeamTableProps = {
  members: TeamMember[];
  onItemClick?: (item: TeamMember) => void;
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

export function TeamTable({ members, onItemClick }: TeamTableProps) {
  if (members.length === 0) {
    return (
      <div className="team-empty">
        <p>Personel bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="team-table-wrapper">
      <table className="team-table">
        <thead>
          <tr>
            <th>Personel</th>
            <th>Departman</th>
            <th>Unvan</th>
            <th>Ekip</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr
              key={member.id}
              onClick={() => onItemClick?.(member)}
              className="team-table__row"
            >
              <td>
                <div className="team-table__person">
                  <div className="team-table__avatar">
                    {member.employeeName.charAt(0).toUpperCase()}
                  </div>
                  <div className="team-table__person-info">
                    <strong>{member.employeeName}</strong>
                    <span>{member.employeeId}</span>
                  </div>
                </div>
              </td>
              <td>{member.department}</td>
              <td>{member.designation}</td>
              <td>{member.teamRef || "-"}</td>
              <td>
                <span className={`team-status ${getStatusClass(member.status)}`}>
                  {member.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
