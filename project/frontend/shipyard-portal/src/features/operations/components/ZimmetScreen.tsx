import type { ZimmetItem } from "../types";

type ZimmetScreenProps = {
  items: ZimmetItem[];
};

export function ZimmetScreen({ items }: ZimmetScreenProps) {
  return (
    <section className="screen-card">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Zimmet akisi</p>
          <h3>Teslim ve iade takibi</h3>
        </div>
        <span className="screen-chip">Zimmet DocType</span>
      </div>
      <div className="zimmet-layout">
        <div className="zimmet-flow">
          <div className="zimmet-flow__step">
            <span>1</span>
            <div>
              <strong>Calisan sec</strong>
              <p>Atamayi kullanici veya ekip bazinda baslat.</p>
            </div>
          </div>
          <div className="zimmet-flow__step">
            <span>2</span>
            <div>
              <strong>Item ve miktar gir</strong>
              <p>Standart Item kaydina bagli tekil teslim olustur.</p>
            </div>
          </div>
          <div className="zimmet-flow__step">
            <span>3</span>
            <div>
              <strong>İade planini izle</strong>
              <p>Vardiya sonunda otomatik kontrol icin not ekle.</p>
            </div>
          </div>
        </div>
        <div className="screen-stack">
          {items.map((item) => (
            <article className="screen-row screen-row--soft" key={item.title}>
              <div className="screen-row__main">
                <div className="screen-row__heading">
                  <h4>{item.title}</h4>
                  <span>{item.status}</span>
                </div>
                <p>
                  {item.holder} - {item.quantity}
                </p>
              </div>
              <div className="screen-row__meta">
                <strong>Plan</strong>
                <span>{item.returnPlan}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
