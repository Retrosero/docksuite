import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPurchaseInvoiceDetail, fetchPurchaseInvoiceList } from "../services/purchaseInvoiceService";
import type { PurchaseInvoiceDetailData, PurchaseInvoiceFilterState, PurchaseInvoiceListData } from "../types";

type UsePurchaseInvoiceDataArgs = {
  filters: PurchaseInvoiceFilterState;
  page: number;
  selectedInvoiceName: string | null;
};

type UsePurchaseInvoiceDataResult = {
  listData: PurchaseInvoiceListData | null;
  detailData: PurchaseInvoiceDetailData | null;
  loadingList: boolean;
  loadingDetail: boolean;
  listError: string | null;
  detailError: string | null;
  refresh: () => void;
};

export function usePurchaseInvoiceData({
  filters,
  page,
  selectedInvoiceName
}: UsePurchaseInvoiceDataArgs): UsePurchaseInvoiceDataResult {
  const [listData, setListData] = useState<PurchaseInvoiceListData | null>(null);
  const [detailData, setDetailData] = useState<PurchaseInvoiceDetailData | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadList() {
      setLoadingList(true);
      setListError(null);

      try {
        const response = await fetchPurchaseInvoiceList(filters, page);

        if (!cancelled) {
          setListData(response);
        }
      } catch {
        if (!cancelled) {
          setListError("Alis faturasi listesi su anda alinamadi. Lutfen tekrar deneyin.");
        }
      } finally {
        if (!cancelled) {
          setLoadingList(false);
        }
      }
    }

    void loadList();

    return () => {
      cancelled = true;
    };
  }, [filters, page, refreshToken]);

  useEffect(() => {
    if (!selectedInvoiceName) {
      setDetailData(null);
      setDetailError(null);
      setLoadingDetail(false);
      return;
    }

    const selectedName = selectedInvoiceName;
    let cancelled = false;

    async function loadDetail() {
      setLoadingDetail(true);
      setDetailError(null);

      try {
        const response = await fetchPurchaseInvoiceDetail(selectedName);

        if (!cancelled) {
          setDetailData(response);
        }
      } catch {
        if (!cancelled) {
          setDetailData(null);
          setDetailError("Fatura detayi su anda alinamadi. Yetkiniz olmayabilir veya kayit silinmis olabilir.");
        }
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedInvoiceName, refreshToken]);

  return useMemo(
    () => ({
      listData,
      detailData,
      loadingList,
      loadingDetail,
      listError,
      detailError,
      refresh
    }),
    [detailData, detailError, listData, listError, loadingDetail, loadingList, refresh]
  );
}
