import { useEffect, useState } from 'react'
import type { RoutePageProps } from '../../app/pageProps'
import { PageSection } from '../../shared/ui/PageSection'
import {
  type PlanType,
  type OnboardingStepKey,
  type OnboardingProgress,
  type PlanModuleConfig,
  type CompanyInfoData,
  type UserSetupData,
  getOnboardingChecklist,
  getPlanModules,
  saveOnboardingProgress,
  updateTenantPlan,
  updateTenantModules,
  createDefaultAccounts,
  completeOnboarding,
  getPlanLabel,
  getPlanPrice,
  getPlanFeatures,
  formatProgressColor,
} from '../../features/onboarding/services/onboardingService'

const ROLE_TEMPLATES = [
  { value: 'yonetici', label: 'Yonetici' },
  { value: 'muhasebe_sorumlusu', label: 'Muhasebe Sorumlusu' },
  { value: 'satis_operasyon', label: 'Satis Operasyon' },
  { value: 'depo_sorumlusu', label: 'Depo Sorumlusu' },
  { value: 'salt_okuma', label: 'Salt Okuma' },
]

const PLANS: PlanType[] = ['Starter', 'Pro', 'Enterprise']

export function OnboardingWizardPage({ subdomain }: RoutePageProps) {
  const [activeStep, setActiveStep] = useState<OnboardingStepKey>('company_info')
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Step data states
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoData>({
    company_name: '',
    tax_id: '',
    address: '',
    phone: '',
    email: '',
  })
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('Starter')
  const [planModules, setPlanModules] = useState<PlanModuleConfig | null>(null)
  const [customModules, setCustomModules] = useState<PlanModuleConfig>({
    finance: true,
    sales: true,
    purchase: false,
    inventory: true,
    e_document: false,
    approval_workflow: false,
    reports: 'basic',
  })
  const [userSetup, setUserSetup] = useState<UserSetupData>({
    first_user_email: '',
    first_user_name: '',
    role_template: 'yonetici',
  })

  useEffect(() => {
    const tenantSubdomain = subdomain || 'default'
    void loadChecklist(tenantSubdomain)
    void loadPlanModules(tenantSubdomain)
  }, [subdomain])

  const loadChecklist = async (tenantSubdomain: string) => {
    setIsLoading(true)
    try {
      const data = await getOnboardingChecklist(tenantSubdomain)
      setProgress(data)
      // Find first uncompleted step
      const firstUncompleted = data.steps.find((s) => !s.completed)
      if (firstUncompleted) setActiveStep(firstUncompleted.key)
    } catch {
      setError('Onboarding bilgileri yuklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPlanModules = async (_tenantSubdomain: string) => {
    try {
      const modules = await getPlanModules(selectedPlan)
      setPlanModules(modules)
      setCustomModules(modules)
    } catch {
      // Use defaults
    }
  }

  const handleSaveAndNext = async () => {
    const tenantSubdomain = subdomain || 'default'
    setIsSaving(true)
    setError(null)

    try {
      let data: Record<string, unknown> = {}

      switch (activeStep) {
        case 'company_info':
          data = companyInfo
          break
        case 'plan_selection':
          data = { plan: selectedPlan }
          await updateTenantPlan(tenantSubdomain, selectedPlan)
          const modules = await getPlanModules(selectedPlan)
          setPlanModules(modules)
          setCustomModules(modules)
          break
        case 'modules':
          data = customModules
          await updateTenantModules(tenantSubdomain, customModules)
          break
        case 'users':
          data = userSetup
          break
      }

      await saveOnboardingProgress(tenantSubdomain, activeStep, data as unknown as Record<string, unknown>)
      await loadChecklist(tenantSubdomain)
      moveToNextStep()
    } catch {
      setError('Kayit basarisiz')
    } finally {
      setIsSaving(false)
    }
  }

  const moveToNextStep = () => {
    if (!progress) return
    const steps = progress.steps
    const currentIndex = steps.findIndex((s) => s.key === activeStep)
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].key)
    }
  }

  const handleCreateAccounts = async () => {
    const tenantSubdomain = subdomain || 'default'
    setIsSaving(true)
    try {
      const count = await createDefaultAccounts(tenantSubdomain)
      await saveOnboardingProgress(tenantSubdomain, 'account_setup', { accounts_created: count } as unknown as Record<string, unknown>)
      await loadChecklist(tenantSubdomain)
      moveToNextStep()
    } catch {
      setError('Hesap olusturulamadi')
    } finally {
      setIsSaving(false)
    }
  }

  const handleComplete = async () => {
    const tenantSubdomain = subdomain || 'default'
    setIsSaving(true)
    try {
      const setupUrl = await completeOnboarding(tenantSubdomain)
      // Redirect to dashboard
      window.location.href = setupUrl
    } catch {
      setError('Tamamlama basarisiz')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleModule = (key: keyof PlanModuleConfig) => {
    setCustomModules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (isLoading) {
    return (
      <PageSection title="Kurulum Sihirbazi" subtitle="Hesabinizi yapilandirin">
        <p className="muted">Yukleniyor...</p>
      </PageSection>
    )
  }

  return (
    <PageSection title="Kurulum Sihirbazi" subtitle="Hesabinizi yapilandirin">
      {/* Progress Bar */}
      {progress && (
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress.overall_progress}%`,
                backgroundColor: formatProgressColor(progress.overall_progress),
              }}
            />
          </div>
          <span className="progress-label">{progress.overall_progress}% tamamlandi</span>
        </div>
      )}

      {/* Step Navigation */}
      {progress && (
        <nav className="step-nav">
          {progress.steps.map((step) => (
            <button
              key={step.key}
              type="button"
              className={`step-btn ${activeStep === step.key ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
              onClick={() => !step.completed && setActiveStep(step.key)}
              disabled={step.completed}
            >
              <span className="step-number">{step.step}</span>
              <span className="step-label">{step.label}</span>
              {step.completed && <span className="step-check">✓</span>}
            </button>
          ))}
        </nav>
      )}

      {/* Error Message */}
      {error ? <p className="error-text">{error}</p> : null}

      {/* Step Content */}
      <div className="step-content">
        {/* Step 1: Company Info */}
        {activeStep === 'company_info' && (
          <div className="form-section">
            <h3>Sirket Bilgileri</h3>
            <p className="muted">Temel sirket bilgilerinizi girin</p>

            <div className="form-group">
              <label htmlFor="company-name">Sirket Adi *</label>
              <input
                type="text"
                id="company-name"
                value={companyInfo.company_name}
                onChange={(e) => setCompanyInfo((p) => ({ ...p, company_name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tax-id">Vergi Numarasi *</label>
              <input
                type="text"
                id="tax-id"
                value={companyInfo.tax_id}
                onChange={(e) => setCompanyInfo((p) => ({ ...p, tax_id: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Adres *</label>
              <textarea
                id="address"
                rows={3}
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo((p) => ({ ...p, address: e.target.value }))}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Telefon</label>
                <input
                  type="tel"
                  id="phone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-posta</label>
                <input
                  type="email"
                  id="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Plan Selection */}
        {activeStep === 'plan_selection' && (
          <div className="form-section">
            <h3>Plan Secimi</h3>
            <p className="muted">Ihtiyaciniza uygun plani secin</p>

            <div className="plan-grid">
              {PLANS.map((plan) => (
                <div
                  key={plan}
                  className={`plan-card ${selectedPlan === plan ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="plan-header">
                    <h4>{getPlanLabel(plan)}</h4>
                    <span className="plan-price">{getPlanPrice(plan)}</span>
                  </div>
                  <ul className="plan-features">
                    {getPlanFeatures(plan).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  {selectedPlan === plan && <span className="selected-badge">Secili</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Module Configuration */}
        {activeStep === 'modules' && (
          <div className="form-section">
            <h3>Modul Yapilandirma</h3>
            <p className="muted">Aktif edilecek modulleri secin</p>

            <div className="module-grid">
              {planModules && Object.entries(planModules).map(([key]) => {
                if (key === 'reports') return null
                return (
                  <label key={key} className="module-toggle">
                    <input
                      type="checkbox"
                      checked={customModules[key as keyof PlanModuleConfig] as boolean}
                      onChange={() => toggleModule(key as keyof PlanModuleConfig)}
                    />
                    <span className="module-label">
                      {key === 'finance' && 'Finans'}
                      {key === 'sales' && 'Satis'}
                      {key === 'purchase' && 'Satin Alma'}
                      {key === 'inventory' && 'Stok'}
                      {key === 'e_document' && 'E-Belge'}
                      {key === 'approval_workflow' && 'Onay Akislari'}
                    </span>
                  </label>
                )
              })}
            </div>

            <div className="form-group">
              <label>Raporlama</label>
              <select
                value={customModules.reports}
                onChange={(e) => setCustomModules((p) => ({ ...p, reports: e.target.value as 'basic' | 'advanced' | 'full' }))}
              >
                <option value="basic">Temel</option>
                <option value="advanced">Gelismis</option>
                <option value="full">Tam</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Account Setup */}
        {activeStep === 'account_setup' && (
          <div className="form-section">
            <h3>Hesap Plani</h3>
            <p className="muted">Varsayilan hesap plani olusturun</p>

            <div className="info-card">
              <p>Bu adim varsayilan muhasebe hesaplarini olusturacaktir:</p>
              <ul>
                <li>Kasa</li>
                <li>Bankalar</li>
                <li>Alacaklar</li>
                <li>Borclar</li>
              </ul>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={() => void handleCreateAccounts()}
              disabled={isSaving}
            >
              {isSaving ? 'Olusturuluyor...' : 'Hesaplari Olustur'}
            </button>
          </div>
        )}

        {/* Step 5: User Setup */}
        {activeStep === 'users' && (
          <div className="form-section">
            <h3>Kullanici Tanimi</h3>
            <p className="muted">Ilk yonetici kullanici atamasi yapin</p>

            <div className="form-group">
              <label htmlFor="user-name">Ad Soyad *</label>
              <input
                type="text"
                id="user-name"
                value={userSetup.first_user_name}
                onChange={(e) => setUserSetup((p) => ({ ...p, first_user_name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-email">E-posta *</label>
              <input
                type="email"
                id="user-email"
                value={userSetup.first_user_email}
                onChange={(e) => setUserSetup((p) => ({ ...p, first_user_email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role-template">Rol Sablonu *</label>
              <select
                id="role-template"
                value={userSetup.role_template}
                onChange={(e) => setUserSetup((p) => ({ ...p, role_template: e.target.value }))}
                required
              >
                {ROLE_TEMPLATES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 6: Complete */}
        {activeStep === 'complete' && (
          <div className="form-section complete-section">
            <div className="success-icon">✓</div>
            <h3>Tebrikler!</h3>
            <p>Kurulum tamamlandi. Artik sisteminizi kullanmaya baslayabilirsiniz.</p>

            <button
              type="button"
              onClick={() => void handleComplete()}
              disabled={isSaving}
            >
              {isSaving ? 'Tamamlaniyor...' : 'Tamamla ve Devam Et'}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {activeStep !== 'complete' && (
        <div className="form-actions">
          <button
            type="button"
            onClick={() => void handleSaveAndNext()}
            disabled={isSaving}
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet ve Devam Et'}
          </button>
        </div>
      )}
    </PageSection>
  )
}