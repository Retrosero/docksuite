import type { PagedResult, PersonnelListItem } from "../types";

type PersonnelListScreenProps = {
  search: string;
  onSearchChange: (value: string) => void;
  result: PagedResult<PersonnelListItem>;
  loading: boolean;
  error: string | null;
  flashMessage: string | null;
  onSelectEmployee: (employeeId: string) => void;
  onPageChange: (nextPage: number) => void;
  onCreateNew: () => void;
};

function formatJoinDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR").format(parsed);
}

export function PersonnelListScreen({
  search,
  onSearchChange,
  result,
  loading,
  error,
  flashMessage,
  onSelectEmployee,
  onPageChange,
  onCreateNew
}: PersonnelListScreenProps) {
  const totalPages = Math.max(Math.ceil(result.total / result.pageSize), 1);
  const hasPreviousPage = result.page > 1;
  const hasNextPage = result.page < totalPages;

  return (
    <section className="screen-card screen-card--accent personnel-screen">
      <div className="panel__header personnel-screen__header">
        <div>
          <p className="eyebrow">Personel listesi</p>
          <h3>Sahadaki ekip ve IK gorunumu</h3>
          <p className="personnel-screen__subline">
            Toplam <strong>{result.total}</strong> kayit
          </p>
          <button className="personnel-create-button" onClick={onCreateNew} type="button">
            Yeni personel ekle
          </button>
        </div>
        <label className="personnel-search" htmlFor="personnel-search">
          <span>Ara</span>
          <input
            id="personnel-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Ad, kod, departman veya unvan"
            type="search"
            value={search}
          />
        </label>
      </div>

      {loading ? <p className="personnel-state">Personel listesi yukleniyor...</p> : null}
      {error ? <p className="personnel-state personnel-state--error">{error}</p> : null}
      {flashMessage ? <p className="personnel-state personnel-state--success">{flashMessage}</p> : null}
      {!loading && !error && result.items.length === 0 ? (
        <p className="personnel-state">Arama kriterine uygun personel bulunamadi.</p>
      ) : null}

      {!loading && !error && result.items.length > 0 ? (
        <div className="personnel-list">
          {result.items.map((employee) => (
            <button
              className="personnel-list__item"
              key={employee.id}
              onClick={() => onSelectEmployee(employee.id)}
              type="button"
            >
              <div className="personnel-list__top">
                <div>
                  <strong>{employee.fullName}</strong>
                  <span>{employee.id}</span>
                </div>
                <span className="screen-chip">{employee.status}</span>
              </div>
              <div className="personnel-list__grid">
                <p>
                  <span>Departman</span>
                  {employee.department}
                </p>
                <p>
                  <span>Unvan</span>
                  {employee.designation}
                </p>
                <p>
                  <span>Ise giris</span>
                  {formatJoinDate(employee.joinDate)}
                </p>
                <p>
                  <span>Telefon</span>
                  {employee.phone}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      <div className="personnel-pagination">
        <button disabled={!hasPreviousPage || loading} onClick={() => onPageChange(result.page - 1)} type="button">
          Geri
        </button>
        <span>
          Sayfa {result.page} / {totalPages}
        </span>
        <button disabled={!hasNextPage || loading} onClick={() => onPageChange(result.page + 1)} type="button">
          Ileri
        </button>
      </div>
    </section>
  );
}
