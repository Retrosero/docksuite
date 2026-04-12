import type { PersonnelDetail } from "../types";

type PersonnelDetailScreenProps = {
  employee: PersonnelDetail | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="personnel-detail__row">
      <dt>{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

export function PersonnelDetailScreen({ employee, loading, error, onBack }: PersonnelDetailScreenProps) {
  return (
    <section className="screen-card personnel-screen">
      <div className="panel__header personnel-screen__header">
        <div>
          <p className="eyebrow">Personel detayi</p>
          <h3>Calisan karti</h3>
        </div>
        <button className="personnel-back-button" onClick={onBack} type="button">
          Listeye don
        </button>
      </div>

      {loading ? <p className="personnel-state">Personel detayi yukleniyor...</p> : null}
      {error ? <p className="personnel-state personnel-state--error">{error}</p> : null}
      {!loading && !error && !employee ? <p className="personnel-state">Personel kaydi bulunamadi.</p> : null}

      {!loading && !error && employee ? (
        <div className="personnel-detail">
          <article className="personnel-detail__card">
            <p className="eyebrow">Kimlik</p>
            <h4>{employee.fullName}</h4>
            <p className="personnel-detail__id">{employee.id}</p>
            <dl>
              <DetailRow label="Durum" value={employee.status} />
              <DetailRow label="Sirket" value={employee.company} />
              <DetailRow label="Ise giris" value={formatJoinDate(employee.joinDate)} />
            </dl>
          </article>

          <article className="personnel-detail__card">
            <p className="eyebrow">Operasyon</p>
            <h4>Saha baglanti bilgisi</h4>
            <dl>
              <DetailRow label="Departman" value={employee.department} />
              <DetailRow label="Unvan" value={employee.designation} />
              <DetailRow label="Shipyard ekip" value={employee.shipyardTeam} />
              <DetailRow label="Shipyard uzmanlik" value={employee.shipyardSpecialty} />
            </dl>
          </article>

          <article className="personnel-detail__card">
            <p className="eyebrow">IK</p>
            <h4>Iletisim ve raporlama</h4>
            <dl>
              <DetailRow label="Telefon" value={employee.phone} />
              <DetailRow label="E-posta" value={employee.email} />
              <DetailRow label="Amir" value={employee.reportsTo} />
            </dl>
          </article>
        </div>
      ) : null}
    </section>
  );
}
