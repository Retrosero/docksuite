import { useDeferredValue, useEffect, useState } from "react";
import { PersonnelListScreen } from "../../features/personnel/components/PersonnelListScreen";
import { getPersonnelList } from "../../features/personnel/services/personnelService";
import type { PagedResult, PersonnelListItem } from "../../features/personnel/types";
import { navigateTo } from "../../app/useAppRoute";

const INITIAL_PAGE = 1;
const PAGE_SIZE = 12;

const INITIAL_RESULT: PagedResult<PersonnelListItem> = {
  items: [],
  total: 0,
  page: INITIAL_PAGE,
  pageSize: PAGE_SIZE
};

export function PersonnelListPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [result, setResult] = useState(INITIAL_RESULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(() => {
    const flash = window.sessionStorage.getItem("shipyard-personnel-flash");
    if (flash) {
      window.sessionStorage.removeItem("shipyard-personnel-flash");
    }
    return flash;
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await getPersonnelList({
          search: deferredSearch,
          page,
          pageSize: PAGE_SIZE
        });

        if (!cancelled) {
          setResult(response);
        }
      } catch {
        if (!cancelled) {
          setError("Personel listesi su anda alinamadi. Lutfen tekrar deneyin.");
          setResult((previous) => ({
            ...previous,
            items: [],
            total: 0,
            page
          }));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [deferredSearch, page]);

  return (
    <div className="operations-page">
      <PersonnelListScreen
        error={error}
        flashMessage={flashMessage}
        loading={loading}
        onPageChange={setPage}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(INITIAL_PAGE);
        }}
        onCreateNew={() => navigateTo("/personel/yeni")}
        onSelectEmployee={(employeeId) => navigateTo(`/personel/${encodeURIComponent(employeeId)}`)}
        result={result}
        search={search}
      />
    </div>
  );
}
