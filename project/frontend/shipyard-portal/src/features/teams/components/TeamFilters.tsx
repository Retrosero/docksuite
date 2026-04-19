import { Search } from "lucide-react";
import type { TeamFilterState } from "../types";

type TeamFiltersProps = {
  filters: TeamFilterState;
  onFiltersChange: (filters: TeamFilterState) => void;
  departmentOptions: string[];
  designationOptions: string[];
  statusOptions: ("Aktif" | "Pasif" | "Izinli")[];
};

export function TeamFilters({
  filters,
  onFiltersChange,
  departmentOptions,
  designationOptions,
  statusOptions
}: TeamFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchText: e.target.value });
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, department: e.target.value });
  };

  const handleDesignationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, designation: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, status: e.target.value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      department: "",
      designation: "",
      status: "",
      searchText: ""
    });
  };

  const hasActiveFilters = filters.department || filters.designation || filters.status || filters.searchText;

  return (
    <div className="team-filters">
      <div className="team-filters__search">
        <Search size={16} aria-hidden="true" />
        <input
          type="text"
          placeholder="Personel veya ekip ara..."
          value={filters.searchText}
          onChange={handleSearchChange}
          aria-label="Personel ara"
        />
      </div>

      <div className="team-filters__selects">
        <select
          value={filters.department}
          onChange={handleDepartmentChange}
          aria-label="Departman filtresi"
        >
          <option value="">Tüm Departmanlar</option>
          {departmentOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select
          value={filters.designation}
          onChange={handleDesignationChange}
          aria-label="Unvan filtresi"
        >
          <option value="">Tüm Unvanlar</option>
          {designationOptions.map((des) => (
            <option key={des} value={des}>
              {des}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={handleStatusChange}
          aria-label="Durum filtresi"
        >
          <option value="">Tüm Durumlar</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="team-filters__clear"
          >
            Temizle
          </button>
        )}
      </div>
    </div>
  );
}
