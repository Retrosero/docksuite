import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Database,
  Plus,
  RefreshCw,
  Search,
  Settings2
} from "lucide-react";
import { useHrSetupData } from "../hooks/useHrSetupData";
import type {
  HrSetupAlert,
  HrSetupData,
  HrSetupMasterKey,
  HrSetupMasterState,
  HrSetupQuickCreateInput,
  HrSetupStep,
  HrSetupSummary
} from "../types";

function getPercent(ready: number, total: number) {
  if (total <= 0) {
    return 100;
  }
  return Math.round((ready / total) * 100);
}

function HrSetupSummaryCards({ summary }: { summary: HrSetupSummary }) {
  const cards = [
    {
      label: "Sirket",
      value: summary.companyCount,
      detail: "Tenant icindeki yasal kayit"
    },
    {
      label: "Aktif Personel",
      value: summary.activeEmployees,
      detail: "IK veri kalitesi icin kontrol edildi"
    },
    {
      label: "Organizasyon",
      value: `${summary.organizationReadyCount}/${summary.organizationTotalCount}`,
      detail: "Master veri hazirligi"
    },
    {
      label: "Surecler",
      value: `${summary.processReadyCount}/${summary.processTotalCount}`,
      detail: "Izin, vardiya ve bordro temeli"
    }
  ];

  return (
    <div className="hr-setup-summary">
      {cards.map((card) => (
        <article className="hr-setup-summary__card" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.detail}</small>
        </article>
      ))}
    </div>
  );
}

function HrSetupProgress({ steps }: { steps: HrSetupStep[] }) {
  return (
    <section className="hr-setup-panel">
      <div className="hr-setup-section-title">
        <div>
          <p className="eyebrow">Kurulum Adimlari</p>
          <h2>IK temel hazirligi</h2>
        </div>
      </div>

      <div className="hr-setup-steps">
        {steps.map((step) => {
          const Icon = step.icon;
          const percent = getPercent(step.readyCount, step.totalCount);

          return (
            <article className="hr-setup-step" key={step.key}>
              <div className={`hr-setup-step__icon${step.completed ? " hr-setup-step__icon--ready" : ""}`}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <div className="hr-setup-step__body">
                <div className="hr-setup-step__topline">
                  <strong>{step.title}</strong>
                  <span>{percent}%</span>
                </div>
                <p>{step.description}</p>
                <div className="hr-setup-progressbar" aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getAlertIcon(tone: HrSetupAlert["tone"]) {
  if (tone === "success") {
    return CheckCircle2;
  }
  return AlertTriangle;
}

function DataQualityAlertList({ alerts }: { alerts: HrSetupAlert[] }) {
  return (
    <section className="hr-setup-panel">
      <div className="hr-setup-section-title">
        <div>
          <p className="eyebrow">Veri Kalitesi</p>
          <h2>Once duzeltilmesi gerekenler</h2>
        </div>
      </div>
      <div className="hr-setup-alert-list">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.tone);

          return (
            <article className={`hr-setup-alert hr-setup-alert--${alert.tone}`} key={alert.id}>
              <Icon size={18} aria-hidden="true" />
              <div>
                <strong>{alert.title}</strong>
                <p>{alert.detail}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MasterDataAccordion({ masters, searchText }: { masters: HrSetupMasterState[]; searchText: string }) {
  const [openKey, setOpenKey] = useState<HrSetupMasterKey>("company");
  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredMasters = masters
    .map((master) => ({
      ...master,
      records: normalizedSearch
        ? master.records.filter((record) => `${record.title} ${record.subtitle}`.toLowerCase().includes(normalizedSearch))
        : master.records
    }))
    .filter((master) => !normalizedSearch || master.records.length > 0 || master.label.toLowerCase().includes(normalizedSearch));

  return (
    <section className="hr-setup-panel hr-setup-panel--masters">
      <div className="hr-setup-section-title">
        <div>
          <p className="eyebrow">Master Veri</p>
          <h2>Standart IK kayitlari</h2>
        </div>
      </div>

      <div className="hr-setup-master-list">
        {filteredMasters.map((master) => {
          const isOpen = openKey === master.key;

          return (
            <article className="hr-setup-master" key={master.key}>
              <button className="hr-setup-master__trigger" onClick={() => setOpenKey(isOpen ? "company" : master.key)} type="button">
                <span>
                  <strong>{master.label}</strong>
                  <small>{master.description}</small>
                </span>
                <span className="hr-setup-master__meta">
                  {master.loadingFailed ? "Okunamadi" : `${master.count} kayit`}
                  <ChevronDown className={isOpen ? "hr-setup-master__chevron--open" : ""} size={16} aria-hidden="true" />
                </span>
              </button>

              {isOpen ? (
                <div className="hr-setup-master__content">
                  {master.records.length > 0 ? (
                    master.records.slice(0, 8).map((record) => (
                      <div className="hr-setup-record" key={`${master.key}-${record.id}`}>
                        <span>
                          <strong>{record.title}</strong>
                          <small>{record.subtitle}</small>
                        </span>
                        <em>{record.status}</em>
                      </div>
                    ))
                  ) : (
                    <p className="hr-setup-empty">Bu bolumde kayit bulunamadi.</p>
                  )}
                  {master.records.length > 8 ? (
                    <p className="hr-setup-more">Ilk 8 kayit gosteriliyor. Detay icin ERPNext liste ekranini kullanin.</p>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

type QuickCreateProps = {
  masters: HrSetupMasterState[];
  saving: boolean;
  saveError: string | null;
  saveMessage: string | null;
  onCreate: (input: HrSetupQuickCreateInput) => Promise<void>;
};

function MasterDataQuickCreateForm({ masters, saving, saveError, saveMessage, onCreate }: QuickCreateProps) {
  const quickCreateMasters = masters.filter((master) => master.canCreateQuickly);
  const companyOptions = masters.find((master) => master.key === "company")?.records ?? [];
  const [masterKey, setMasterKey] = useState<HrSetupMasterKey>(quickCreateMasters[0]?.key ?? "department");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(companyOptions[0]?.id ?? "");

  const selectedMaster = quickCreateMasters.find((master) => master.key === masterKey);
  const needsCompany = masterKey === "department";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate({ masterKey, title, company });
    setTitle("");
  }

  return (
    <section className="hr-setup-panel">
      <div className="hr-setup-section-title">
        <div>
          <p className="eyebrow">Hizli Ekle</p>
          <h2>Basit master kaydi</h2>
        </div>
      </div>

      <form className="hr-setup-form" onSubmit={handleSubmit}>
        <label>
          Kayit Tipi
          <select value={masterKey} onChange={(event) => setMasterKey(event.target.value as HrSetupMasterKey)}>
            {quickCreateMasters.map((master) => (
              <option key={master.key} value={master.key}>
                {master.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Kayit Adi
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={`${selectedMaster?.label ?? "Kayit"} adi`}
            required
          />
        </label>

        {needsCompany ? (
          <label>
            Sirket
            <select value={company} onChange={(event) => setCompany(event.target.value)}>
              <option value="">Sirket secilmedi</option>
              {companyOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {saveError ? <p className="hr-setup-form__message hr-setup-form__message--error">{saveError}</p> : null}
        {saveMessage ? <p className="hr-setup-form__message hr-setup-form__message--success">{saveMessage}</p> : null}

        <button className="hr-setup-primary-action" disabled={saving} type="submit">
          <Plus size={16} aria-hidden="true" />
          {saving ? "Kaydediliyor..." : "Kayit Ekle"}
        </button>
      </form>
    </section>
  );
}

function HrSetupLoadedContent({
  data,
  saving,
  saveError,
  saveMessage,
  onCreate
}: {
  data: HrSetupData;
  saving: boolean;
  saveError: string | null;
  saveMessage: string | null;
  onCreate: (input: HrSetupQuickCreateInput) => Promise<void>;
}) {
  const [searchText, setSearchText] = useState("");

  return (
    <>
      <HrSetupSummaryCards summary={data.summary} />

      <div className="hr-setup-toolbar">
        <label className="hr-setup-search">
          <Search size={17} aria-hidden="true" />
          <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Master veri ara..." type="search" />
        </label>
      </div>

      <div className="hr-setup-layout">
        <div className="hr-setup-layout__side">
          <HrSetupProgress steps={data.steps} />
          <DataQualityAlertList alerts={data.alerts} />
          <MasterDataQuickCreateForm
            masters={data.masters}
            saving={saving}
            saveError={saveError}
            saveMessage={saveMessage}
            onCreate={onCreate}
          />
        </div>

        <div className="hr-setup-layout__main">
          <MasterDataAccordion masters={data.masters} searchText={searchText} />
        </div>
      </div>
    </>
  );
}

export function HrSetupCenterScreen() {
  const { data, loading, error, saving, saveError, saveMessage, refresh, createMaster } = useHrSetupData();

  const heroText = useMemo(() => {
    if (!data) {
      return "Sirket, departman, unvan, izin, vardiya ve bordro temel verileri kontrol ediliyor.";
    }

    const percent = getPercent(data.summary.organizationReadyCount + data.summary.processReadyCount, data.summary.organizationTotalCount + data.summary.processTotalCount);
    return `Temel IK kurulumu ${percent}% hazir. Eksikleri tamamlayarak personel, izin, vardiya ve bordro ekranlarini daha saglam kullanabilirsiniz.`;
  }, [data]);

  return (
    <section className="hr-setup-screen">
      <header className="hr-setup-hero">
        <div className="hr-setup-hero__copy">
          <p className="eyebrow">IK Kurulum Merkezi</p>
          <h1>IK Kurulum Merkezi</h1>
          <p>{heroText}</p>
        </div>
        <div className="hr-setup-hero__actions">
          <button className="hr-setup-secondary-action" onClick={refresh} disabled={loading} type="button">
            <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
            Yenile
          </button>
        </div>
      </header>

      {error ? (
        <div className="hr-setup-state hr-setup-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-setup-state">
          <Database size={18} aria-hidden="true" />
          <p>IK kurulum verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <HrSetupLoadedContent
          data={data}
          saving={saving}
          saveError={saveError}
          saveMessage={saveMessage}
          onCreate={createMaster}
        />
      ) : null}

      {!loading && !error && !data ? (
        <div className="hr-setup-state">
          <Settings2 size={18} aria-hidden="true" />
          <p>Gosterilecek IK kurulum verisi bulunamadi.</p>
        </div>
      ) : null}
    </section>
  );
}
