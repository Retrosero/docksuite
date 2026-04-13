import { SectionIntro } from "../../features/operations/components/SectionIntro";
import { PurchaseInvoiceScreen } from "../../features/purchase-invoice/components/PurchaseInvoiceScreen";

export function PurchaseInvoicePage() {
  return (
    <div className="operations-page">
      <SectionIntro
        chip="Purchase Invoice"
        description="Alis faturalarini tedarikci ve tarih filtreleriyle sade bir ekranda takip edin. Liste secimine gore detay panelinde kalemleri goruntuleyin."
        eyebrow="Satin alma / muhasebe"
        title="Alis Faturalari"
      />
      <PurchaseInvoiceScreen />
    </div>
  );
}
