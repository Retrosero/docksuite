import type { PersonnelDetail } from "../types";

type PersonnelDetailScreenProps = {
  employee: PersonnelDetail | null;
  loading: boolean;
  error: string | null;
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

export function PersonnelDetailScreen({
  employee,
  loading,
  error,
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
