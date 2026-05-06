# Production Readiness Checklist (2026-05-06)

## Ortamlar

### Staging Ortami
- [ ] Frappe bench kurulumu
- [ ] shipyard_app yuklenmesi
- [ ] Veritabani migrations
- [ ] NES Portal test hesabi entegrasyonu

### Production Ortami
- [ ] CI/CD pipeline tamamlanmasi
- [ ] Domain/SSL yapilandirmasi
- [ ] Backup stratejisi
- [ ] Monitoring/alerting

## Guvenlik

### Tenant Isolation
- [ ] API tenant boundary testleri
- [ ] Veritabani sirket izolasyonu
- [ ] Session/token yonetimi

### Endpoint Guvenligi
- [ ] Authentication zorunlulugu
- [ ] Role-based access control
- [ ] Rate limiting

## Performans

### Backend
- [ ] Database query optimization
- [ ] Caching stratejisi
- [ ] Async job handling

### Frontend
- [ ] Bundle size optimization
- [ ] Lazy loading
- [ ] Service worker/PWA

## Test Kapsami

### Unit Tests
- [ ] Backend API methods
- [ ] Frontend components
- [ ] Utility functions

### E2E Tests
- [ ] Critical user flows
- [ ] Onboarding akisi
- [ ] Fatura olusturma/onay

## Dokumantasyon

- [ ] API reference (Swagger)
- [ ] Admin rehberi
- [ ] Kullanici rehberi
- [ ] Deployment rehberi