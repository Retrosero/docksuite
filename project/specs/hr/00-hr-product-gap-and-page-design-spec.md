# IK Urun Gap Analizi ve Sayfa Tasarim Spec'i

## Amac
Bu spec, mevcut ERPNext + Frappe HR altyapisini tersane disinda farkli sirketlerde de kullanilabilecek bir IK SaaS urunune donusturmek icin eksik IK modullerini, oncelik sirasini ve sayfa tasarimlarini tanimlar.

Kural: ERPNext ve HRMS core degistirilmez. Standart DocType yeterliyse standart veri kaynagi kullanilir. Sadece sirketlere tekrar satilabilir, tenant-safe ve config ile yonetilebilir ek ihtiyaclarda custom app katmani kullanilir.

## Kaynaklar
- Yerel proje kurallari: `project/rules/`
- Yerel skill dosyalari: `project/skills/`
- Yerel ERPNext referanslari: `project/docs/erpnext/`
- Yerel hafiza: `project/memory/`
- Resmi Frappe HR dokumani: https://docs.frappe.io/hr/introduction
- Resmi HR Settings dokumani: https://docs.frappe.io/hr/hr-settings
- Resmi Payroll Setup dokumani: https://docs.frappe.io/hr/payroll-setup
- Resmi HR Reports dokumani: https://docs.frappe.io/hr/human-resources-reports

## Mevcut Durum
Projede mevcut olan IK kapsami:
- Personel listesi, detay, olusturma ve guncelleme ekranlari
- Vardiya takibi ve vardiya planlama ekranlari
- Attendance saat girisi
- Izin takibi ve izin basvurusu
- Fazla mesai talep ve onay ekranlari
- Maas bilgisi ve bordro hesaplama ekranlari
- Kullanici/yetki ve tenant ayarlari
- Demo HR seed: personel, mesai, izin, salary slip, leave allocation, shift assignment

Mevcut custom/aday yapilar:
- `Employee.shipyard_monthly_base_salary`
- `Employee.shipyard_team_ref`
- `Employee.shipyard_specialty`
- `Attendance.shipyard_site_location`
- Custom operasyon DocType'lari: `Team`, `Zimmet`, `Field Report`, `Task Progress`, `Technical Document Link`

## IK Uzmani Bakisiyla Eksik Moduller

### P0 - Satilabilir IK Urunu Icin Kritik Eksikler
1. Organizasyon master veri merkezi
   - Kapsam: Company, Branch, Department, Designation, Employment Type, Employee Grade, Employee Group
   - Eksik: IK kullanicisi icin sade kurulum ve veri kalitesi ekrani yok.
   - Standart kaynak: ERPNext/Frappe HR master DocType'lari
   - Sayfa: `IK Kurulum Merkezi`

2. Personel ozluk dosyasi ve belge takibi
   - Kapsam: kimlik, sozlesme, saglik raporu, sertifika, egitim belgesi, is guvenligi evraki
   - Eksik: belge tipi, son gecerlilik tarihi, eksik belge uyarisi ve dosya goruntuleme akisi yok.
   - Standart kaynak: `Employee`, `File`
   - Custom aday: `Employee Document Checklist` veya `Employee Document Record`
   - Sayfa: `Ozluk Dosyasi`

3. Ise alim ve aday takip
   - Kapsam: kadro talebi, ilan, aday, mulakat, teklif, atama
   - Eksik: Recruitment modulu portalda yok.
   - Standart kaynak: `Staffing Plan`, `Job Requisition`, `Job Opening`, `Job Applicant`, `Interview`, `Job Offer`
   - Sayfa: `Aday Takip`

4. Ise giris ve onboarding
   - Kapsam: ise giris gorevleri, belge toplama, ekipman zimmeti, hesap acma, oryantasyon
   - Eksik: Employee Onboarding akisi portalda yok; zimmet ile personel yasam dongusu baglantisi zayif.
   - Standart kaynak: `Employee Onboarding`
   - Custom baglanti: mevcut `Zimmet`, `Technical Document Link`
   - Sayfa: `Ise Giris Sureci`

5. Isten cikis ve offboarding
   - Kapsam: cikis gorusmesi, zimmet iadesi, kalan izin, final bordro, evrak teslimi
   - Eksik: Employee Separation, Exit Interview ve Full and Final Statement portali yok.
   - Standart kaynak: `Employee Separation`, `Exit Interview`, `Full and Final Statement`
   - Sayfa: `Isten Cikis Sureci`

### P1 - Operasyonel Olgunluk Eksikleri
6. Performans ve hedef yonetimi
   - Kapsam: hedef, degerlendirme donemi, yetkinlik geri bildirimi, appraisal
   - Eksik: Performance modulu portalda yok.
   - Standart kaynak: `Goal`, `Appraisal Cycle`, `Appraisal`, `Employee Performance Feedback`
   - Sayfa: `Performans`

7. Egitim ve sertifika yonetimi
   - Kapsam: egitim programi, katilim, sonuc, geri bildirim, sertifika gecerliligi
   - Eksik: Training ekranlari yok; sertifika takip karti personel listesinde gorunuyor ama veri modeli tamam degil.
   - Standart kaynak: `Training Program`, `Training Event`, `Training Result`, `Training Feedback`
   - Custom aday: sertifika gecerlilik alanlari icin belge kaydi
   - Sayfa: `Egitim ve Sertifika`

8. Avans, masraf ve seyahat
   - Kapsam: personel avansi, masraf talebi, seyahat talebi, onay, muhasebe entegrasyonu
   - Eksik: Expense Claim / Employee Advance / Travel Request portalda yok.
   - Standart kaynak: `Employee Advance`, `Expense Claim`, `Travel Request`
   - Sayfa: `Avans ve Masraf`

9. Yan haklar, kesintiler ve ek odemeler
   - Kapsam: yemek, yol, prim, ek odeme, kesinti, esnek yan hak, vergi istisna beyanlari
   - Eksik: Maas ekraninda basit gorunum var; benefits, Additional Salary ve tax/benefit akislari urunlesmemis.
   - Standart kaynak: `Additional Salary`, `Employee Benefit Application`, `Employee Benefit Claim`, tax exemption DocType'lari
   - Sayfa: `Yan Haklar`

10. IK raporlari ve denetim paneli
   - Kapsam: headcount, turnover, devamsizlik, izin bakiye, fazla mesai maliyeti, belge eksigi, bordro toplam
   - Eksik: yonetici ve IK icin karar paneli yok.
   - Standart kaynak: HR reports + portal aggregate endpointleri
   - Sayfa: `IK Raporlari`

### P2 - Kurumsal Paket Eksikleri
11. Organizasyon semasi
   - Kapsam: raporlama hiyerarsisi, yonetici ekipleri, acik pozisyonlar
   - Standart kaynak: `Employee.reports_to`, Organizational Chart
   - Sayfa: `Organizasyon Semasi`

12. Saglik, guvenlik ve uygunluk
   - Kapsam: saglik sigortasi, periyodik muayene, is guvenligi egitimi, saha uygunluk
   - Standart kaynak: `Employee Health Insurance`
   - Custom aday: `Employee Compliance Record`
   - Sayfa: `Uygunluk Takibi`

13. Calisan self servis
   - Kapsam: profilim, izin basvurusu, masraf talebi, bordrom, belgelerim, bildirimler
   - Eksik: roller var ama calisan odakli sade ana ekran ayrismamis.
   - Standart kaynak: Employee, Leave, Salary Slip, Expense Claim, File
   - Sayfa: `Calisan Paneli`

## Uygulama Sirasi

### Faz 1 - IK Temelini Temizle
1. `IK Kurulum Merkezi`
2. `Ozluk Dosyasi`
3. Mevcut `Personel` ekranini belge, eksik veri ve onboarding durumu ile genislet

### Faz 2 - Personel Yasam Dongusu
4. `Aday Takip`
5. `Ise Giris Sureci`
6. `Isten Cikis Sureci`

### Faz 3 - IK Operasyonlari
7. `Egitim ve Sertifika`
8. `Avans ve Masraf`
9. `Yan Haklar`

### Faz 4 - Yonetim ve Kurumsal Paket
10. `Performans`
11. `IK Raporlari`
12. `Organizasyon Semasi`
13. `Uygunluk Takibi`
14. `Calisan Paneli`

## Sayfa Tasarimlari

### 1. IK Kurulum Merkezi
Hedef kullanici: IK yoneticisi, sistem yoneticisi

Veri kaynaklari:
- `Company`
- `Branch`
- `Department`
- `Designation`
- `Employment Type`
- `Employee Grade`
- `Employee Group`
- `Holiday List`
- `Leave Type`
- `Leave Period`

Ekran bolumleri:
- Ust ozet: sirket, departman, unvan, izin tipi, tatil listesi sayilari
- Kurulum adimlari: Organizasyon, Izin, Vardiya, Bordro, Yetki
- Eksik veri uyarilari: departmansiz personel, unvansiz personel, tatil listesi olmayan sirket
- Master veri listeleri: mobilde kart, masaustunde tablo
- Hizli olusturma paneli: minimum alanli inline form

Mobile-first tasarim:
- Ilk ekranda yatay kaymayan ozet kartlari
- Her master veri grubu accordion olarak acilir
- Olusturma formu alttan acilan panel davranisi ile calisir

Component plan:
- `HrSetupCenterPage`
- `HrSetupProgress`
- `MasterDataAccordion`
- `MasterDataQuickCreateForm`
- `DataQualityAlertList`

API plan:
- Liste: `GET /api/resource/{DocType}`
- Olusturma: `POST /api/resource/{DocType}`
- Ozel endpoint sadece veri kalite ozetini tek cagriya indirmek icin dusunulebilir.

### 2. Ozluk Dosyasi
Hedef kullanici: IK, yonetici, calisan

Veri kaynaklari:
- `Employee`
- `File`
- Custom aday: `Employee Document Record`

Custom DocType adayi:
- `employee`
- `document_type`
- `file`
- `issue_date`
- `expiry_date`
- `status`
- `is_required`
- `note`

Ekran bolumleri:
- Personel baslik karti: ad, gorev, departman, durum
- Belge durum ozeti: tamam, eksik, suresi dolan, yenileme bekleyen
- Belge listesi: belge tipi, dosya, gecerlilik tarihi, durum
- Belge yukleme formu
- Eksik belge kontrol listesi

Mobile-first tasarim:
- Mobilde belge kartlari, masaustunde tablo
- Yukleme aksiyonu tek ana buton
- Sure dolumu renkli durum etiketi ile gosterilir

Component plan:
- `EmployeeDocumentPage`
- `DocumentStatusCards`
- `DocumentChecklist`
- `DocumentUploadForm`
- `DocumentList`

### 3. Aday Takip
Hedef kullanici: IK, departman yoneticisi

Veri kaynaklari:
- `Staffing Plan`
- `Job Requisition`
- `Job Opening`
- `Job Applicant`
- `Interview`
- `Interview Feedback`
- `Job Offer`

Ekran bolumleri:
- Acik pozisyon ozeti
- Aday kanban: Basvuru, On Eleme, Mulakat, Teklif, Ise Alindi, Reddedildi
- Aday detay paneli
- Mulakat planlama formu
- Teklif hazirlama aksiyonu

Mobile-first tasarim:
- Mobilde durum sekmeleri
- Masaustunde kanban kolonlari
- Aday detaylari sag panelde acilir

Component plan:
- `RecruitmentPipelinePage`
- `JobOpeningSummary`
- `ApplicantStageTabs`
- `ApplicantKanban`
- `InterviewScheduleForm`

### 4. Ise Giris Sureci
Hedef kullanici: IK, IT/admin, depo sorumlusu, yonetici

Veri kaynaklari:
- `Employee Onboarding`
- `Employee`
- `Task` veya onboarding icindeki activity yapisi
- `Zimmet`
- `File`

Ekran bolumleri:
- Ise baslayacak personel listesi
- Onboarding gorevleri
- Belge toplama durumu
- Zimmet hazirlik listesi
- Tamamlama aksiyonu

Mobile-first tasarim:
- Her personel icin ilerleme karti
- Gorevler checklist olarak gosterilir
- Kritik eksikler ustte sabit uyarida verilir

Component plan:
- `OnboardingPage`
- `OnboardingProgressCard`
- `OnboardingTaskChecklist`
- `OnboardingDocumentPanel`
- `OnboardingAssetPanel`

### 5. Isten Cikis Sureci
Hedef kullanici: IK, yonetici, depo sorumlusu, muhasebe

Veri kaynaklari:
- `Employee Separation`
- `Exit Interview`
- `Full and Final Statement`
- `Leave Allocation`
- `Salary Slip`
- `Zimmet`

Ekran bolumleri:
- Cikis sureci listesi
- Zimmet iade kontrolu
- Kalan izin ve bordro etkisi
- Cikis gorusmesi formu
- Final tamamlama aksiyonu

Mobile-first tasarim:
- Surec adimlari timeline olarak
- Her adimda sorumlu rol ve durum etiketi
- Riskli eksikler kirmizi uyarida

Component plan:
- `OffboardingPage`
- `SeparationTimeline`
- `AssetReturnChecklist`
- `FinalPayrollPreview`
- `ExitInterviewForm`

### 6. Performans
Hedef kullanici: IK, yonetici, calisan

Veri kaynaklari:
- `Goal`
- `Appraisal Cycle`
- `Appraisal`
- `Employee Performance Feedback`

Ekran bolumleri:
- Aktif donem ozeti
- Hedef listesi
- Degerlendirme formu
- Geri bildirim gecmisi
- Ekip performans ozeti

Mobile-first tasarim:
- Calisan icin kendi hedefleri odakli sade ekran
- Yonetici icin ekip sekmeleri
- Degerlendirme uzun formu bolumlere ayrilir

Component plan:
- `PerformancePage`
- `GoalList`
- `AppraisalCycleSummary`
- `FeedbackForm`
- `TeamPerformanceGrid`

### 7. Egitim ve Sertifika
Hedef kullanici: IK, ISG sorumlusu, yonetici

Veri kaynaklari:
- `Training Program`
- `Training Event`
- `Training Result`
- `Training Feedback`
- `File`
- Custom belge kaydi

Ekran bolumleri:
- Egitim takvimi
- Katilim listesi
- Sertifika durumlari
- Suresi dolacak belgeler
- Egitim sonucu girisi

Mobile-first tasarim:
- Mobilde takvim yerine yakin egitim listesi
- Sertifika kartlarinda son gecerlilik tarihi
- Toplu katilim girisi masaustunde tablo ile

Component plan:
- `TrainingPage`
- `TrainingCalendarList`
- `CertificateExpiryList`
- `TrainingAttendanceForm`
- `TrainingResultTable`

### 8. Avans ve Masraf
Hedef kullanici: calisan, yonetici, muhasebe

Veri kaynaklari:
- `Employee Advance`
- `Expense Claim`
- `Travel Request`

Ekran bolumleri:
- Talep olusturma
- Bekleyen onaylar
- Odeme/mahsup durumu
- Fis/fatura ekleri
- Muhasebe aktarim durumu

Mobile-first tasarim:
- Calisan icin tek "Yeni Talep" aksiyonu
- Talep tipi segmented control: Avans, Masraf, Seyahat
- Onayci ekraninda kuyruk listesi

Component plan:
- `ExpenseAdvancePage`
- `ClaimTypeSegment`
- `ExpenseClaimForm`
- `AdvanceRequestForm`
- `ApprovalQueue`

### 9. Yan Haklar
Hedef kullanici: IK, bordro sorumlusu, calisan

Veri kaynaklari:
- `Additional Salary`
- `Employee Benefit Application`
- `Employee Benefit Claim`
- `Salary Component`
- vergi istisna DocType'lari

Ekran bolumleri:
- Yan hak katalogu
- Personel bazli yan hak atamalari
- Ek odeme/kesinti listesi
- Calisan yan hak basvurusu
- Bordroya yansima ozeti

Mobile-first tasarim:
- Calisan tarafinda basit hak listesi
- IK tarafinda personel bazli filtreli tablo
- Bordro etkisi kart olarak gosterilir

Component plan:
- `BenefitsPage`
- `BenefitCatalog`
- `EmployeeBenefitAssignments`
- `AdditionalSalaryList`
- `BenefitClaimForm`

### 10. IK Raporlari
Hedef kullanici: IK yoneticisi, ust yonetim

Veri kaynaklari:
- `Employee`
- `Attendance`
- `Leave Application`
- `Leave Allocation`
- `Overtime Request`
- `Salary Slip`
- `Employee Document Record`
- HR report endpointleri

Ekran bolumleri:
- Headcount ve turnover
- Devamsizlik ve vardiya uyumu
- Izin bakiye ve kullanim
- Fazla mesai maliyeti
- Bordro toplam ozeti
- Eksik/suresi dolan belge listesi

Mobile-first tasarim:
- Ustte donem filtresi
- KPI kartlari iki kolonlu mobil grid
- Detay raporlar tab ile ayrilir

Component plan:
- `HrReportsPage`
- `HrKpiGrid`
- `AttendanceRiskPanel`
- `LeaveBalanceReport`
- `PayrollCostSummary`
- `DocumentComplianceReport`

### 11. Organizasyon Semasi
Hedef kullanici: IK, yonetici

Veri kaynaklari:
- `Employee`
- `Department`
- `Designation`
- `Employee.reports_to`

Ekran bolumleri:
- Arama ve departman filtresi
- Hiyerarsi agaci
- Yonetici ekip listesi
- Bos pozisyon notlari

Mobile-first tasarim:
- Mobilde agac yerine kademe kademe drill-down
- Masaustunde genis hiyerarsi gorunumu

Component plan:
- `OrgChartPage`
- `OrgTree`
- `OrgDrilldownList`
- `ManagerTeamPanel`

### 12. Uygunluk Takibi
Hedef kullanici: IK, ISG, yonetici

Veri kaynaklari:
- `Employee Health Insurance`
- `Employee`
- `File`
- Custom aday: `Employee Compliance Record`

Custom DocType adayi:
- `employee`
- `compliance_type`
- `valid_from`
- `valid_until`
- `status`
- `file`
- `responsible_role`
- `note`

Ekran bolumleri:
- Uygunluk KPI'lari
- Suresi dolacak kayitlar
- Personel bazli uygunluk detaylari
- Belge yenileme formu

Mobile-first tasarim:
- Risk oncelikli liste
- Durum etiketleri: Gecerli, Yaklasiyor, Suresi Doldu, Eksik

Component plan:
- `CompliancePage`
- `ComplianceKpiGrid`
- `ComplianceRiskList`
- `ComplianceRecordForm`

### 13. Calisan Paneli
Hedef kullanici: calisan

Veri kaynaklari:
- `Employee`
- `Leave Application`
- `Attendance`
- `Salary Slip`
- `Expense Claim`
- `File`

Ekran bolumleri:
- Bugunku durum: vardiya, giris/cikis, izin durumu
- Hizli islemler: izin iste, masraf gir, belgem, bordrom
- Son bildirimler
- Profil ve eksik bilgi uyarilari

Mobile-first tasarim:
- Ilk ekran tamamen mobil aksiyon odakli
- ERP terimleri gizlenir
- Ana aksiyonlar ikonlu buton olarak verilir

Component plan:
- `EmployeeSelfServicePage`
- `TodayStatusCard`
- `SelfServiceActionGrid`
- `MyDocumentsPanel`
- `MyPayrollPanel`

## Genel UI Standarti
- Tum metinler Turkce olacak.
- Mobilde kart/list, masaustunde tablo + detay paneli kullanilacak.
- Flowbite MIT component'leri once tercih edilecek: Button, Badge, Alert, Modal/Drawer, Tabs, Accordion, Table, Forms.
- Lucide ikonlari kullanilacak.
- ERPNext DocType isimleri son kullanici ekraninda gerekmedikce gosterilmeyecek.
- Business logic component icine gomulmeyecek; feature bazli service/hook katmani kullanilacak.
- Tenant ozel davranis config veya feature flag ile yonetilecek.

## Veri Modeli Kararlari

Standart ile ilerle:
- Organizasyon master verileri
- Recruitment
- Employee Onboarding/Separation
- Leave
- Attendance/Shift
- Payroll
- Performance
- Training
- Expense/Advance/Travel

Custom DocType adaylari:
- `Employee Document Record`: ozluk ve sertifika dosyalari icin tekrar eden belge kaydi
- `Employee Compliance Record`: saglik/ISG/uygunluk tarih takibi icin tekrar eden kayit

Custom Field adaylari:
- `Employee.shipyard_team_ref` genellestirilerek `employee_team_ref` veya mevcut urun standardi olarak korunabilir.
- `Employee.shipyard_specialty` sirketler arasi ortak yetkinlik alanina donusturulebilir.
- Yeni firmaya ozel sabit secenekler hardcode edilmez; gerekirse ayar DocType'i veya config kullanilir.

## Kabul Kriterleri
- Her faz kendi spec'i, implementation notu, test sonucu ve memory guncellemesi ile kapanir.
- Her yeni sayfa mobile-first ve Turkce arayuzle calisir.
- Standart ERPNext/HRMS verisi kopyalanmaz.
- Core app degil custom app ve frontend katmani kullanilir.
- Yeni custom yapilar fixture/migrate ile yeni tenant'a kurulabilir olur.
- Yetki kontrolu role ve route access katmanindan gecmeden sayfa acilmaz.

## Ilk Yapilacak Is
Birinci uygulama adimi `IK Kurulum Merkezi` olmalidir. Nedeni: diger tum IK ekranlari Department, Designation, Employment Type, Leave Type, Holiday List, Shift Type ve Payroll temel ayarlarinin temiz olmasina baglidir.

Ilk teknik spec dosyasi:
- `project/specs/hr/01-hr-setup-center-page-spec.md`

Ilk implementasyon hedefi:
- `src/features/hr-setup`
- `src/pages/hr/HrSetupCenterPage.tsx`
- route: `/ik-kurulum`

