import type { PropsWithChildren } from "react";
import { tenantConfig } from "../config/tenant";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="shell">
      <header className="shell__header">
        <div>
          <p className="eyebrow">Tersane operasyon portali</p>
          <h1>{tenantConfig.productName}</h1>
        </div>
        <div className="shell__tenant-card">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>{tenantConfig.tenantLabel}</strong>
            <p>{tenantConfig.supportLabel}</p>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
