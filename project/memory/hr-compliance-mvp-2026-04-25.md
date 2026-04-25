# HR Compliance Tracking MVP - 2026-04-25

## Scope
- Faz 4 dorduncu adim olarak `Uygunluk Takibi` ekraninin ilk surumu acildi.
- Route: `/uygunluk-takibi`
- Veri kaynagi: `Employee Health Insurance`, `Employee Document Record`, `Employee`

## Implemented
- Yeni feature katmani:
  - `src/features/hr-compliance/types.ts`
  - `src/features/hr-compliance/services/hrComplianceService.ts`
  - `src/features/hr-compliance/hooks/useHrComplianceData.ts`
  - `src/features/hr-compliance/components/HrComplianceScreen.tsx`
- Yeni page:
  - `src/pages/hr/CompliancePage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/uygunluk-takibi`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Saglik sigortasi:
  - police bitis tarihine gore `Suresi Doldu` / `Yaklasiyor` / `Gecerli`
- Belge uyum riski:
  - Employee Document Record icinde zorunlu ve gecerlilik riski tasiyan kayitlar
- Sigorta eksikligi:
  - aktif Employee listesinde Health Insurance eslesmesi olmayan personeller

## Robustness
- `canReadDoctype` ile yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Tarih bazli risk belirleme (expired/expiring soon) fail-safe hesaplanir.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
