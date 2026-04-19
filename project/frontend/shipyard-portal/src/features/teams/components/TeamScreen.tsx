import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTeamData } from "../hooks/useTeamData";
import { TeamSummaryCards } from "./TeamSummaryCards";
import { TeamFilters } from "./TeamFilters";
import { TeamTable } from "./TeamTable";
import { TeamCardList } from "./TeamCardList";
import type { TeamFilterState, TeamMember } from "../types";

export function TeamScreen() {
  const [filters, setFilters] = useState<TeamFilterState>({
    department: "",
    designation: "",
    status: "",
    searchText: ""
  });

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { data, loading, error, refresh } = useTeamData(filters);

  const handleFiltersChange = (newFilters: TeamFilterState) => {
    setFilters(newFilters);
  };

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const handleCloseDetail = () => {
    setSelectedMember(null);
  };

  return (
    <div className="team-screen">
      <header className="team-screen__header">
        <div className="team-screen__title">
          <p className="eyebrow">Ekip Yönetimi</p>
          <h1>Ekipler</h1>
          <p className="team-screen__subline">
            {data 
              ? `${data.summary.totalMembers} personel, ${data.summary.totalTeams} ekip` 
              : "Yükleniyor..."}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="team-screen__refresh"
          aria-label="Yenile"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
        </button>
      </header>

      {error && (
        <div className="team-error">
          <p>{error}</p>
        </div>
      )}

      {data && (
        <TeamSummaryCards summary={data.summary} />
      )}

      {data && (
        <TeamFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          departmentOptions={data.departmentOptions}
          designationOptions={data.designationOptions}
          statusOptions={data.statusOptions}
        />
      )}

      <div className="team-screen__content">
        {loading && !data && (
          <div className="team-loading">
            <p>Ekipler yükleniyor...</p>
          </div>
        )}

        {data && (
          <>
            {/* Desktop Table View */}
            <div className="team-desktop-view">
              <TeamTable members={data.members} onItemClick={handleMemberClick} />
            </div>

            {/* Mobile Card View - grouped by team */}
            <div className="team-mobile-view">
              <TeamCardList teams={data.teams} onItemClick={handleMemberClick} />
            </div>
          </>
        )}
      </div>

      {selectedMember && (
        <div className="team-detail-overlay" onClick={handleCloseDetail}>
          <aside className="team-detail" onClick={(e) => e.stopPropagation()}>
            <header className="team-detail__header">
              <h3>Personel Detayı</h3>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="team-detail__close"
              >
                ✕
              </button>
            </header>
            <div className="team-detail__content">
              <div className="team-detail__avatar">
                {selectedMember.employeeName.charAt(0).toUpperCase()}
              </div>
              <h4 className="team-detail__name">{selectedMember.employeeName}</h4>
              <p className="team-detail__id">ID: {selectedMember.employeeId}</p>

              <dl className="team-detail__list">
                <div>
                  <dt>Departman</dt>
                  <dd>{selectedMember.department}</dd>
                </div>
                <div>
                  <dt>Unvan</dt>
                  <dd>{selectedMember.designation}</dd>
                </div>
                <div>
                  <dt>Ekip</dt>
                  <dd>{selectedMember.teamRef || "-"}</dd>
                </div>
                <div>
                  <dt>İstihdam Türü</dt>
                  <dd>{selectedMember.employmentType || "-"}</dd>
                </div>
                <div>
                  <dt>Durum</dt>
                  <dd>{selectedMember.status}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
