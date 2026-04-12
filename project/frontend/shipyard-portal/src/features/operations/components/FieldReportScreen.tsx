import type { FieldReportItem } from "../types";

type FieldReportScreenProps = {
  reports: FieldReportItem[];
};

export function FieldReportScreen({ reports }: FieldReportScreenProps) {
  return (
    <section className="screen-card screen-card--accent">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Saha bildirimi</p>
          <h3>Mobil sorun kaydi formu</h3>
        </div>
        <span className="screen-chip">Field Report</span>
      </div>
      <div className="field-report-layout">
        <form className="mock-form">
          <label>
            Baslik
            <input defaultValue="Pompa dairesi sicaklik artisi" />
          </label>
          <label>
            Konum
            <input defaultValue="Blok C / Seviye 2" />
          </label>
          <label>
            Sorun tipi
            <select defaultValue="Teknik ariza">
              <option>Teknik ariza</option>
              <option>ISG</option>
              <option>Bakim</option>
            </select>
          </label>
          <label>
            Aciklama
            <textarea defaultValue="Saha ekibi sicaklik degerini kontrol ederek acil bakim istiyor." />
          </label>
          <label className="mock-upload">
            Fotograf
            <div>+ Foto yukle</div>
          </label>
        </form>
        <div className="screen-stack">
          {reports.map((report) => (
            <article className="screen-row screen-row--soft" key={report.title}>
              <div className="screen-row__main">
                <div className="screen-row__heading">
                  <h4>{report.title}</h4>
                  <span>{report.severity}</span>
                </div>
                <p>
                  {report.location} - {report.employee}
                </p>
              </div>
              <div className="screen-row__meta">
                <strong>{report.issueType}</strong>
                <span>{report.time}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
