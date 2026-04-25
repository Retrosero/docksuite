import type { PersonnelDetail, PersonnelMonthlyActivity, PersonnelMonthlyMovement } from "../types";

type PersonnelDetailScreenProps = {
  employee: PersonnelDetail | null;
  loading: boolean;
  error: string | null;
  activity: PersonnelMonthlyActivity | null;
  activityLoading: boolean;
  activityError: string | null;
  activityMonth: { year: number; month: number };
  onActivityMonthChange: (year: number, month: number) => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  deleting: boolean;
  deleteError: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR").format(parsed);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="personnel-detail__row">
      <dt>{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

function formatAmount(value: number | null) {
  if (value === null) {
    return "";
  }
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
}

function formatHours(value: number | null) {
  if (value === null) {
    return "";
  }
  return `${value.toFixed(2)} saat`;
}

function toMovementToneClass(item: PersonnelMonthlyMovement) {
  if (item.tone === "positive") return "personnel-movement--positive";
  if (item.tone === "warning") return "personnel-movement--warning";
  return "personnel-movement--neutral";
}

function documentStatusLabel(present: boolean) {
  return present ? "Tamam" : "Eksik";
}

export function PersonnelDetailScreen({
  employee,
  loading,
  error,
  activity,
  activityLoading,
  activityError,
  activityMonth,
  onActivityMonthChange,
  onBack,
  onEdit,
  onDelete,
  deleting,
  deleteError
}: PersonnelDetailScreenProps) {
  return (
    <section className="screen-card personnel-screen">
      <div className="panel__header personnel-screen__header">
        <div>
          <p className="eyebrow">Personel detayi</p>
          <h3>Calisan karti</h3>
        </div>
        <div className="personnel-detail__actions">
          <button className="personnel-back-button" onClick={onBack} type="button">
            Listeye don
          </button>
          <button className="personnel-create-button" onClick={onEdit} type="button">
            Duzenle
          </button>
        </div>
      </div>

      {loading ? <p className="personnel-state">Personel detayi yukleniyor...</p> : null}
      {error ? <p className="personnel-state personnel-state--error">{error}</p> : null}
      {deleteError ? <p className="personnel-state personnel-state--error">{deleteError}</p> : null}
      {!loading && !error && !employee ? <p className="personnel-state">Personel kaydi bulunamadi.</p> : null}

      {!loading && !error && employee ? (
        <div className="personnel-detail">
          <article className="personnel-detail__card">
            <p className="eyebrow">Kimlik</p>
            <h4>{employee.fullName}</h4>
            <p className="personnel-detail__id">{employee.id}</p>
            <dl>
              <DetailRow label="Durum" value={employee.status} />
              <DetailRow label="Ad" value={employee.firstName} />
              <DetailRow label="Soyad" value={employee.lastName} />
              <DetailRow label="Cinsiyet" value={employee.gender} />
              <DetailRow label="Sirket" value={employee.company} />
              <DetailRow label="Ise giris" value={formatDate(employee.joinDate)} />
              <DetailRow label="Dogum tarihi" value={formatDate(employee.birthDate)} />
            </dl>
          </article>

          <article className="personnel-detail__card">
            <p className="eyebrow">Operasyon</p>
            <h4>Saha baglanti bilgisi</h4>
            <dl>
              <DetailRow label="Departman" value={employee.department} />
              <DetailRow label="Unvan" value={employee.designation} />
              <DetailRow label="Sube" value={employee.branch} />
              <DetailRow label="Shipyard ekip" value={employee.shipyardTeam} />
              <DetailRow label="Shipyard uzmanlik" value={employee.shipyardSpecialty} />
              <DetailRow label="Amir" value={employee.reportsTo} />
            </dl>
          </article>

          <article className="personnel-detail__card">
            <p className="eyebrow">IK</p>
            <h4>Iletisim ve erisim</h4>
            <dl>
              <DetailRow label="Telefon" value={employee.phone} />
              <DetailRow label="Acil durum telefonu" value={employee.emergencyPhone} />
              <DetailRow label="Sirket e-postasi" value={employee.companyEmail} />
              <DetailRow label="Kisisel e-posta" value={employee.email} />
              <DetailRow label="Guncel adres" value={employee.currentAddress} />
              <DetailRow label="Kalici adres" value={employee.permanentAddress} />
            </dl>
          </article>

          <article className="personnel-detail__card personnel-detail__card--documents">
            <div className="personnel-document__header">
              <div>
                <p className="eyebrow">Ozluk Dosyasi</p>
                <h4>Belge durum ozeti</h4>
              </div>
              <div className="personnel-document__summary">
                <span>{employee.documentSummary.totalDocuments} belge</span>
                <strong>{employee.documentSummary.missingCount} eksik</strong>
              </div>
            </div>

            <div className="personnel-document__checklist">
              {employee.documentSummary.checklist.length === 0 ? (
                <p className="personnel-state">Belge kontrol listesi henuz olusmadi.</p>
              ) : (
                employee.documentSummary.checklist.map((item) => (
                  <div className="personnel-document__check-item" key={item.key}>
                    <span>{item.label}</span>
                    <em className={item.present ? "personnel-document__badge--ok" : "personnel-document__badge--missing"}>
                      {documentStatusLabel(item.present)}
                    </em>
                  </div>
                ))
              )}
            </div>

            <div className="personnel-document__list">
              <strong>Son yuklenen belgeler</strong>
              {employee.documentSummary.recentDocuments.length === 0 ? (
                <p className="personnel-state">Bu personel icin yuklenmis dosya bulunmuyor.</p>
              ) : (
                employee.documentSummary.recentDocuments.map((document) => (
                  <a
                    className="personnel-document__item"
                    href={document.fileUrl}
                    key={document.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span>
                      <strong>{document.fileName}</strong>
                      <small>{document.documentType}</small>
                    </span>
                    <em>{formatDate(document.uploadedAt)}</em>
                  </a>
                ))
              )}
            </div>
          </article>

          <article className="personnel-detail__card personnel-detail__card--salary">
            <div className="personnel-movement__header">
              <div>
                <p className="eyebrow">Aylik Hareketler</p>
                <h4>Calisma, Mesai, Avans ve Odeme Akisi</h4>
              </div>
              <div className="personnel-movement__filters">
                <select
                  value={activityMonth.year}
                  onChange={(event) => onActivityMonthChange(Number(event.target.value), activityMonth.month)}
                >
                  {[activityMonth.year - 1, activityMonth.year, activityMonth.year + 1].map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
                <select
                  value={activityMonth.month}
                  onChange={(event) => onActivityMonthChange(activityMonth.year, Number(event.target.value))}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((monthOption) => (
                    <option key={monthOption} value={monthOption}>
                      {new Intl.DateTimeFormat("tr-TR", { month: "long" }).format(new Date(activityMonth.year, monthOption - 1, 1))}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activityLoading ? <p className="personnel-state">Aylik hareketler yukleniyor...</p> : null}
            {activityError ? <p className="personnel-state personnel-state--error">{activityError}</p> : null}

            {!activityLoading && !activityError && activity ? (
              <>
                <div className="personnel-movement__summary">
                  <span>{activity.movementCount} hareket</span>
                  <strong>Calisma: {activity.totalWorkedHours.toFixed(2)} saat</strong>
                  <strong>Mesai: {activity.totalOvertimeHours.toFixed(2)} saat</strong>
                  <strong>Avans: {formatAmount(activity.totalAdvanceAmount)}</strong>
                  <strong>Odeme: {formatAmount(activity.totalPaymentAmount)}</strong>
                </div>

                <div className="personnel-movement__list">
                  {activity.movements.length === 0 ? (
                    <p className="personnel-state">Secili ayda hareket kaydi bulunmuyor.</p>
                  ) : (
                    activity.movements.map((item) => (
                      <div key={item.id} className={`personnel-movement ${toMovementToneClass(item)}`}>
                        <div className="personnel-movement__top">
                          <strong>{item.title}</strong>
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <p>{item.detail}</p>
                        <div className="personnel-movement__meta">
                          {item.durationHours !== null ? <span>{formatHours(item.durationHours)}</span> : null}
                          {item.amount !== null ? <span>{formatAmount(item.amount)}</span> : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : null}
          </article>

          <article className="personnel-detail__card personnel-detail__card--danger">
            <p className="eyebrow">Kayit islemleri</p>
            <h4>Ekle, duzenle, sil akisi</h4>
            <div className="personnel-flow">
              <p>1. Yeni personel icin liste ekranindaki ekle aksiyonunu kullanin.</p>
              <p>2. Eksik alanlari duzenle butonuyla tamamlayin ve daha fazla bilgi ekleyin.</p>
              <p>3. Kayit aktif olmayacaksa sil aksiyonunu bu karttan yonetin.</p>
            </div>
            <button className="personnel-danger-button" disabled={deleting} onClick={() => void onDelete()} type="button">
              {deleting ? "Siliniyor..." : "Personeli sil"}
            </button>
          </article>
        </div>
      ) : null}
    </section>
  );
}
