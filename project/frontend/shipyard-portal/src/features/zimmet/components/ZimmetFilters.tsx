import { Search } from "lucide-react";
import type { ZimmetFilterState } from "../types";

type ZimmetFiltersProps = {
  filters: ZimmetFilterState;
  onFiltersChange: (filters: ZimmetFilterState) => void;
  statusOptions: string[];
};

export function ZimmetFilters({
  filters,
  onFiltersChange,
  statusOptions
}: ZimmetFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchText: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, status: e.target.value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: "",
      searchText: ""
    });
  };

  const hasActiveFilters = filters.status || filters.searchText;

  return (
    <div className="zimmet-filters">
      <div className="zimmet-filters__search">
        <Search size={16} aria-hidden="true" />
        <input
          type="text"
          placeholder="Zimmet ara..."
          value={filters.searchText}
          onChange={handleSearchChange}
          aria-label="Zimmet ara"
        />
      </div>

      <div className="zimmet-filters__selects">
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
            className="zimmet-filters__clear"
          >
            Temizle
          </button>
        )}
      </div>
    </div>
  );
}