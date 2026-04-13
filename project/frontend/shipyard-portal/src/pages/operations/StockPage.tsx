import { StockScreen } from "../../features/stock/components/StockScreen";
import { SectionIntro } from "../../features/operations/components/SectionIntro";

export function StockPage() {
  return (
    <div className="operations-page">
      <SectionIntro
        chip="Item"
        description="Stok kartlarini barkod, urun grubu, 2. reyon ve kritik stok etiketiyle sade bir listede takip edin."
        eyebrow="Stok"
        title="Stok Listesi"
      />
      <StockScreen />
    </div>
  );
}
