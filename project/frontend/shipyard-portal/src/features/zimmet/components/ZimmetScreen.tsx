import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { navigateTo } from "../../../app/useAppRoute";
import { useZimmetData } from "../hooks/useZimmetData";
import { ZimmetSummaryCards } from "./ZimmetSummaryCards";
import { ZimmetFilters } from "./ZimmetFilters";
import { ZimmetTable } from "./ZimmetTable";
import { ZimmetCardList } from "./ZimmetCardList";
import type { ZimmetFilterState, ZimmetItem } from "../types";

export function ZimmetScreen() {
  const [filters, setFilters] = useState<ZimmetFilterState>({
    status: "",
    searchText: ""
  });

  const [selectedItem, setSelectedItem] = useState<ZimmetItem | null>(null);

  const { data, loading, error, refresh } = useZimmetData(filters);

  const handleFiltersChange = (newFilters: ZimmetFilterState) => {
    setFilters(newFilters);
  };

  const handleItemClick = (item: ZimmetItem) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  return (
    <div className="zimmet-screen">
      <header className="zimmet-screen__header">
        <div className="zimmet-screen__title">
          <p className="eyebrow">Zimmet Yönetimi</p>
          <h1>Zimmet</h1>
          <p className="zimmet-screen__subline">
            {data 
              ? `${data.summary.total} kayıt, ${data.summary.pending} beklemede` 
              : "Yükleniyor..."}
          </p>
        </div>
        <div className="zimmet-screen__actions">
          <button
            type="button"
            onClick={refresh}
            className="zimmet-screen__refresh"
            aria-label="Yenile"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
          <button type="button" className="zimmet-screen__add" onClick={() => navigateTo("/zimmet/yeni")}>
            <Plus size={16} />
            Yeni Zimmet
          </button>
        </div>
      </header>

      {error && (
        <div className="zimmet-error">
          <p>{error}</p>
        </div>
      )}

      {data && (
        <ZimmetSummaryCards summary={data.summary} />
      )}

      {data && (
        <ZimmetFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          statusOptions={data.statusOptions}
        />
      )}

      <div className="zimmet-screen__content">
        {loading && !data && (
          <div className="zimmet-loading">
            <p>Zimmet kayıtları yükleniyor...</p>
          </div>
        )}

        {data && (
          <>
            {/* Desktop Table View */}
            <div className="zimmet-desktop-view">
              <ZimmetTable items={data.items} onItemClick={handleItemClick} />
            </div>

            {/* Mobile Card View */}
            <div className="zimmet-mobile-view">
              <ZimmetCardList items={data.items} onItemClick={handleItemClick} />
            </div>
          </>
        )}
      </div>

      {selectedItem && (
        <div className="zimmet-detail-overlay" onClick={handleCloseDetail}>
          <aside className="zimmet-detail" onClick={(e) => e.stopPropagation()}>
            <header className="zimmet-detail__header">
              <h3>Zimmet Detayı</h3>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="zimmet-detail__close"
              >
                ✕
              </button>
            </header>
            <div className="zimmet-detail__content">
              <dl className="zimmet-detail__list">
                <div>
                  <dt>Malzeme</dt>
                  <dd>{selectedItem.itemName}</dd>
                </div>
                <div>
                  <dt>Ürün Kodu</dt>
                  <dd>{selectedItem.itemCode}</dd>
                </div>
                <div>
                  <dt>Personel</dt>
                  <dd>{selectedItem.employeeName}</dd>
                </div>
                <div>
                  <dt>Adet</dt>
                  <dd>{selectedItem.quantity}</dd>
                </div>
                <div>
                  <dt>Durum</dt>
                  <dd>{selectedItem.status}</dd>
                </div>
                <div>
                  <dt>Teslim Tarihi</dt>
                  <dd>{selectedItem.deliveryDate || "-"}</dd>
                </div>
                {selectedItem.returnDate && (
                  <div>
                    <dt>İade Tarihi</dt>
                    <dd>{selectedItem.returnDate}</dd>
                  </div>
                )}
                {selectedItem.notes && (
                  <div className="zimmet-detail__description">
                    <dt>Notlar</dt>
                    <dd>{selectedItem.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
