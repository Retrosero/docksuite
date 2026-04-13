import { CalendarDays, ChevronLeft, ChevronRight, Filter, MoreVertical, Search, ShieldCheck, Users } from "lucide-react";
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

function normalizeStatus(status: string) {
  return status.trim().toLowerCase();
}

function getStatusLabel(status: string) {
  const normalized = normalizeStatus(status);

  if (normalized === "active") {
    return "Aktif";
  }

  if (normalized === "inactive") {
    return "Pasif";
  }

  if (normalized === "left") {
    return "Ayrıldı";
  }

  return status || "-";
}

function getStatusTone(status: string) {
  const normalized = normalizeStatus(status);

  if (normalized === "active") {
    return "personnel-status-badge--success";
  }

  if (normalized === "inactive") {
    return "personnel-status-badge--warning";
  }

  if (normalized === "left") {
    return "personnel-status-badge--muted";
  }

  return "personnel-status-badge--neutral";
}

function getRowMeta(employee: PersonnelListItem) {
  const lineOne = [employee.designation, employee.department].filter((item) => item && item !== "-").join(" / ");
  const lineTwo = [employee.email, employee.phone].filter((item) => item && item !== "-").join(" • ");

  return {
    lineOne: lineOne || "-",
    lineTwo: lineTwo || "-"
  };
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

  const activeCount = result.items.filter((employee) => normalizeStatus(employee.status) === "active").length;
  const missingContactCount = result.items.filter(
    (employee) => employee.phone === "-" || employee.email === "-"
  ).length;
  const currentPageStart = result.items.length === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const currentPageEnd = Math.min(result.page * result.pageSize, result.total);

  const departmentSummary = Object.values(
    result.items.reduce<Record<string, { name: string; count: number; progress: number }>>((accumulator, employee) => {
      const key = employee.department || "Belirsiz";
      const existing = accumulator[key];

      if (existing) {
        existing.count += 1;
        existing.progress = Math.min(100, existing.count * 25);
        return accumulator;
      }

      accumulator[key] = {
        name: key,
        count: 1,
        progress: 25
      };

      return accumulator;
    }, {})
  )
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);

  return (
    <section className="personnel-screen">
      <div className="personnel-hero">
        <div className="personnel-hero__copy">
          <p className="eyebrow">Personel Yönetimi</p>
          <h1>Personel Yönetimi</h1>
          <p className="personnel-hero__subline">
            Tersane personel listesi, departman dağılımı ve aktif durum takibi tek ekranda.
          </p>
        </div>
        <button className="personnel-create-button personnel-create-button--hero" onClick={onCreateNew} type="button">
          <Users size={16} aria-hidden="true" />
          Yeni Personel Ekle
        </button>
      </div>

      <div className="personnel-metrics">
        <article className="personnel-metric-card">
          <div className="personnel-metric-card__icon personnel-metric-card__icon--primary">
            <Users size={24} aria-hidden="true" />
          </div>
          <div>
            <strong>{result.total}</strong>
            <span>Aktif Personel</span>
          </div>
        </article>
        <article className="personnel-metric-card">
          <div className="personnel-metric-card__icon personnel-metric-card__icon--secondary">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <div>
            <strong>{activeCount}</strong>
            <span>Bu Sayfadaki Aktif Kayıt</span>
          </div>
        </article>
        <article className="personnel-metric-card">
          <div className="personnel-metric-card__icon personnel-metric-card__icon--tertiary">
            <CalendarDays size={24} aria-hidden="true" />
          </div>
          <div>
            <strong>{missingContactCount}</strong>
            <span>Eksik İletişim Bilgisi</span>
          </div>
        </article>
      </div>

      <div className="personnel-toolbar">
        <label className="personnel-toolbar__search" htmlFor="personnel-search">
          <Search size={18} aria-hidden="true" />
          <input
            id="personnel-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="İsim veya görev ara..."
            type="search"
            value={search}
          />
        </label>
        <div className="personnel-toolbar__filters">
          <select aria-label="Departman filtresi" defaultValue="all">
            <option value="all">Departman: Hepsi</option>
            <option value="engineering">Engineering</option>
            <option value="hr">HR</option>
            <option value="maintenance">Maintenance</option>
            <option value="deck">Deck</option>
          </select>
          <select aria-label="Durum filtresi" defaultValue="all">
            <option value="all">Durum: Hepsi</option>
            <option value="field">Saha İçinde</option>
            <option value="leave">İzinde</option>
            <option value="off">Mesai Dışı</option>
          </select>
          <select aria-label="Vardiya filtresi" defaultValue="all">
            <option value="all">Vardiya: Hepsi</option>
            <option value="day">Gündüz</option>
            <option value="night">Gece</option>
          </select>
          <button className="personnel-toolbar__filter-button" type="button">
            <Filter size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading ? <p className="personnel-state">Personel listesi yükleniyor...</p> : null}
      {error ? <p className="personnel-state personnel-state--error">{error}</p> : null}
      {flashMessage ? <p className="personnel-state personnel-state--success">{flashMessage}</p> : null}

      {!loading && !error && result.items.length === 0 ? (
        <p className="personnel-state">Arama kriterine uygun personel bulunamadı.</p>
      ) : null}

      {!loading && !error && result.items.length > 0 ? (
        <>
          <div className="personnel-table-card personnel-desktop-only">
            <div className="personnel-table__head">
              <span>Personel</span>
              <span>Görev / Departman</span>
              <span>İletişim</span>
              <span>Durum</span>
              <span>Son Hareket</span>
              <span className="personnel-table__actions-head">İşlem</span>
            </div>
            <div className="personnel-table__body">
              {result.items.map((employee) => {
                const { lineOne, lineTwo } = getRowMeta(employee);

                return (
                  <button
                    className="personnel-table__row"
                    key={employee.id}
                    onClick={() => onSelectEmployee(employee.id)}
                    type="button"
                  >
                    <span className="personnel-table__person">
                      <span className="personnel-table__avatar">{employee.fullName.slice(0, 2).toUpperCase()}</span>
                      <span>
                        <strong>{employee.fullName}</strong>
                        <small>ID: {employee.id}</small>
                      </span>
                    </span>
                    <span className="personnel-table__meta">
                      <strong>{lineOne}</strong>
                      <small>{employee.company}</small>
                    </span>
                    <span className="personnel-table__meta">
                      <strong>{employee.email}</strong>
                      <small>{employee.phone}</small>
                    </span>
                    <span>
                      <span className={`personnel-status-badge ${getStatusTone(employee.status)}`}>
                        {getStatusLabel(employee.status)}
                      </span>
                    </span>
                    <span className="personnel-table__meta">
                      <strong>{formatJoinDate(employee.joinDate)}</strong>
                      <small>{employee.department || employee.designation || "-"}</small>
                    </span>
                    <span className="personnel-table__actions">
                      <MoreVertical size={18} aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="personnel-mobile-list personnel-mobile-only">
            {result.items.map((employee) => {
              const { lineOne, lineTwo } = getRowMeta(employee);

              return (
                <button
                  className="personnel-mobile-card"
                  key={employee.id}
                  onClick={() => onSelectEmployee(employee.id)}
                  type="button"
                >
                  <div className="personnel-mobile-card__top">
                    <div>
                      <strong>{employee.fullName}</strong>
                      <span>{employee.id}</span>
                    </div>
                    <span className={`personnel-status-badge ${getStatusTone(employee.status)}`}>
                      {getStatusLabel(employee.status)}
                    </span>
                  </div>
                  <div className="personnel-mobile-card__grid">
                    <p>
                      <span>Görev / Departman</span>
                      {lineOne}
                    </p>
                    <p>
                      <span>İletişim</span>
                      {lineTwo}
                    </p>
                    <p>
                      <span>Son Hareket</span>
                      {formatJoinDate(employee.joinDate)}
                    </p>
                    <p>
                      <span>Şube</span>
                      {employee.company}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <div className="personnel-pagination">
        <button disabled={!hasPreviousPage || loading} onClick={() => onPageChange(result.page - 1)} type="button">
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span>
          {currentPageStart}-{currentPageEnd} / {result.total} personel gösteriliyor
        </span>
        <button disabled={!hasNextPage || loading} onClick={() => onPageChange(result.page + 1)} type="button">
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="personnel-bottom-grid">
        <section className="personnel-department-panel">
          <div className="personnel-section-title">
            <h2>Departman Yoğunluğu</h2>
            <button type="button">Raporu Gör</button>
          </div>
          <div className="personnel-department-grid">
            {departmentSummary.map((department) => (
              <article className="personnel-department-card" key={department.name}>
                <div className="personnel-department-card__label">{department.name}</div>
                <div className="personnel-department-card__count">{department.count}</div>
                <div className="personnel-progress">
                  <div className="personnel-progress__bar" style={{ width: `${department.progress}%` }} />
                </div>
              </article>
            ))}
            {departmentSummary.length === 0 ? (
              <article className="personnel-department-card personnel-department-card--empty">
                <div className="personnel-department-card__label">Veri yok</div>
                <div className="personnel-department-card__count">0</div>
                <div className="personnel-progress">
                  <div className="personnel-progress__bar" style={{ width: "0%" }} />
                </div>
              </article>
            ) : null}
          </div>
        </section>

        <aside className="personnel-safety-card">
          <ShieldCheck size={38} aria-hidden="true" />
          <div className="personnel-safety-card__copy">
            <span>Güvenlik Durumu</span>
            <h3>Sertifika Takibi</h3>
          </div>
          <div className="personnel-safety-card__metrics">
            <div>
              <span>Süresi Dolanlar</span>
              <strong>{missingContactCount}</strong>
            </div>
            <div>
              <span>Yenileme Bekleyen</span>
              <strong>{activeCount}</strong>
            </div>
          </div>
          <button type="button">Listeyi İncele</button>
        </aside>
      </div>
    </section>
  );
}
