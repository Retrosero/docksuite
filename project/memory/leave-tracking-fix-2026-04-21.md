# Leave Tracking Fix (2026-04-21)

## Scope
- `Izin Yonetimi` ekraninda veri yukleme problemi giderildi.
- ERPNext demo HR seed akisina Leave Allocation uretimi eklendi.

## Frontend Changes
- `src/features/leave/components/LeaveTrackingScreen.tsx`
  - `effectiveFilters` nesnesi `useMemo` ile sabitlendi.
- `src/features/leave/hooks/useLeaveTrackingData.ts`
  - Effect bagimliliklari nesne referansi yerine alan bazli takip edilecek sekilde guncellendi.

## Root Cause
- Filtre nesnesi her render'da yeni referansla olusuyordu.
- Hook effect'i her render'da tekrar calisarak ekranin surekli `loading` durumunda kalmasina neden oluyordu.

## ERPNext Seed Changes
- `project/apps/shipyard_app/shipyard_app/demo_hr_seed.py`
  - `_ensure_leave_allocation` helper eklendi.
  - `seed_demo_hr_data` icinde yillik `Leave Allocation` olusturma adimi eklendi.
  - Seed output `created.leave_allocations` alanini donuyor.
  - `get_demo_hr_data_counts` output'una `leave_allocations` sayimi eklendi.

## Verification
- Frontend build: `npm run build` basarili.
- Python compile: `python -m compileall project/apps/shipyard_app/shipyard_app/demo_hr_seed.py` basarili.
- `bench --site frontend execute ...` denemesi bu Windows ortaminda `bench` CLI (`ModuleNotFoundError: No module named 'pwd'`) nedeniyle dogrulanamadi.
