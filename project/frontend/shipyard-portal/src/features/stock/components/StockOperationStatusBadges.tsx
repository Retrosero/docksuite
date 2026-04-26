type StockOperationStatusBadgesProps = {
  title: string;
  saving: boolean;
  lastSuccessId: string | null;
  errorMessage: string | null;
};

export function StockOperationStatusBadges({ title, saving, lastSuccessId, errorMessage }: StockOperationStatusBadgesProps) {
  const statusLabel = saving ? "Isleniyor" : errorMessage ? "Hata" : lastSuccessId ? "Hazir" : "Bekliyor";
  const statusClass = saving
    ? "stock-op-badge stock-op-badge--loading"
    : errorMessage
      ? "stock-op-badge stock-op-badge--error"
      : lastSuccessId
        ? "stock-op-badge stock-op-badge--success"
        : "stock-op-badge";

  return (
    <div className="stock-op-status" aria-label={`${title} durum rozetleri`}>
      <span className={statusClass}>{statusLabel}</span>
      {lastSuccessId ? <span className="stock-op-badge stock-op-badge--id">Belge: {lastSuccessId}</span> : null}
      {errorMessage ? <span className="stock-op-badge stock-op-badge--error">Son hata</span> : null}
    </div>
  );
}
