import { erpPost, erpGet } from '../../../services/erpApi'

// =============================================================================
// Faz A': Tenant Onboarding Iyilestirmesi - Servis Katmani
// =============================================================================

export type PlanType = 'Starter' | 'Pro' | 'Enterprise'
export type OnboardingStepKey = 'company_info' | 'plan_selection' | 'modules' | 'account_setup' | 'users' | 'complete'

export interface PlanModuleConfig {
  finance: boolean
  sales: boolean
  purchase: boolean
  inventory: boolean
  e_document: boolean
  approval_workflow: boolean
  reports: 'basic' | 'advanced' | 'full'
}

export interface OnboardingStep {
  step: number
  key: OnboardingStepKey
  label: string
  description: string
  completed: boolean
  can_skip?: boolean
  is_required?: boolean
}

export interface OnboardingProgress {
  subdomain: string
  steps: OnboardingStep[]
  completed_count: number
  total_steps: number
  overall_progress: number
  is_complete: boolean
}

export interface CompanyInfoData {
  company_name: string
  tax_id: string
  address: string
  phone?: string
  email?: string
}

export interface PlanSelectionData {
  plan: PlanType
}

export interface ModuleConfigData {
  finance: boolean
  sales: boolean
  purchase: boolean
  inventory: boolean
  e_document: boolean
  approval_workflow: boolean
  reports: 'basic' | 'advanced' | 'full'
}

export interface UserSetupData {
  first_user_email: string
  first_user_name: string
  role_template: string
}

type OnboardingResponse = { message?: OnboardingProgress | OnboardingStep[] | PlanModuleConfig }
type ActionResponse = { message?: { status: string; subdomain: string; plan?: string; modules?: PlanModuleConfig; accounts_created?: number; setup_url?: string } }

const ONBOARDING_ENDPOINTS = {
  checklist: '/method/shipyard_app.pre_accounting_onboarding.get_onboarding_checklist',
  steps: '/method/shipyard_app.pre_accounting_onboarding.get_onboarding_steps',
  save_progress: '/method/shipyard_app.pre_accounting_onboarding.save_onboarding_progress',
  plan_modules: '/method/shipyard_app.pre_accounting_onboarding.get_plan_modules',
  update_plan: '/method/shipyard_app.pre_accounting_onboarding.update_tenant_plan',
  update_modules: '/method/shipyard_app.pre_accounting_onboarding.update_tenant_modules',
  create_accounts: '/method/shipyard_app.pre_accounting_onboarding.create_default_accounts',
  complete: '/method/shipyard_app.pre_accounting_onboarding.complete_onboarding',
}

export async function getOnboardingChecklist(subdomain: string): Promise<OnboardingProgress> {
  const response = await erpPost<OnboardingResponse, { subdomain: string }>(
    ONBOARDING_ENDPOINTS.checklist,
    { subdomain }
  )
  if (!response.message || typeof response.message !== 'object') {
    throw new Error('Checklist alinamadi')
  }
  return response.message as OnboardingProgress
}

export async function getOnboardingSteps(subdomain: string): Promise<OnboardingStep[]> {
  const response = await erpPost<OnboardingResponse, { subdomain: string }>(
    ONBOARDING_ENDPOINTS.steps,
    { subdomain }
  )
  if (!Array.isArray(response.message)) {
    throw new Error('Adimlar alinamadi')
  }
  return response.message as OnboardingStep[]
}

export async function saveOnboardingProgress(
  subdomain: string,
  stepKey: OnboardingStepKey,
  data: CompanyInfoData | PlanSelectionData | ModuleConfigData | UserSetupData
): Promise<boolean> {
  const response = await erpPost<ActionResponse, { subdomain: string; step_key: string; data: Record<string, unknown> }>(
    ONBOARDING_ENDPOINTS.save_progress,
    { subdomain, step_key: stepKey, data: data as Record<string, unknown> }
  )
  return response.message?.status === 'saved'
}

export async function getPlanModules(plan: PlanType): Promise<PlanModuleConfig> {
  const response = await erpPost<OnboardingResponse, { plan: PlanType }>(
    ONBOARDING_ENDPOINTS.plan_modules,
    { plan }
  )
  if (!response.message || typeof response.message !== 'object') {
    throw new Error('Plan modulleri alinamadi')
  }
  return response.message as PlanModuleConfig
}

export async function updateTenantPlan(subdomain: string, plan: PlanType): Promise<boolean> {
  const response = await erpPost<ActionResponse, { subdomain: string; plan: PlanType }>(
    ONBOARDING_ENDPOINTS.update_plan,
    { subdomain, plan }
  )
  return response.message?.status === 'updated'
}

export async function updateTenantModules(subdomain: string, modules: PlanModuleConfig): Promise<boolean> {
  const response = await erpPost<ActionResponse, { subdomain: string; modules: PlanModuleConfig }>(
    ONBOARDING_ENDPOINTS.update_modules,
    { subdomain, modules }
  )
  return response.message?.status === 'updated'
}

export async function createDefaultAccounts(subdomain: string): Promise<number> {
  const response = await erpPost<ActionResponse, { subdomain: string }>(
    ONBOARDING_ENDPOINTS.create_accounts,
    { subdomain }
  )
  return response.message?.accounts_created ?? 0
}

export async function completeOnboarding(subdomain: string): Promise<string> {
  const response = await erpPost<ActionResponse, { subdomain: string }>(
    ONBOARDING_ENDPOINTS.complete,
    { subdomain }
  )
  return response.message?.setup_url ?? '/'
}

// Helper functions
export function getPlanLabel(plan: PlanType): string {
  const labels: Record<PlanType, string> = {
    'Starter': 'Starter - Temel',
    'Pro': 'Pro - Orta Boyut',
    'Enterprise': 'Enterprise - Buyuk Isletme',
  }
  return labels[plan] || plan
}

export function getPlanPrice(plan: PlanType): string {
  const prices: Record<PlanType, string> = {
    'Starter': '499 TL/ay',
    'Pro': '999 TL/ay',
    'Enterprise': '2.499 TL/ay',
  }
  return prices[plan] || '-'
}

export function getPlanFeatures(plan: PlanType): string[] {
  const features: Record<PlanType, string[]> = {
    'Starter': [
      'Finans modulu',
      'Satis yonetimi',
      'Stok takibi',
      '5 kullanici',
      'Temel raporlar',
    ],
    'Pro': [
      'Finans modulu',
      'Satis ve satin alma',
      'Stok takibi',
      'E-belge entegrasyonu',
      'Onay akislari',
      '15 kullanici',
      'Gelismis raporlar',
    ],
    'Enterprise': [
      'Tum Pro ozellikleri',
      'Limitsiz kullanici',
      'Tam raporlama',
      'Oncelikli destek',
      'API erisimi',
      'Ozel entegrasyonlar',
    ],
  }
  return features[plan] || []
}

export function formatProgressColor(progress: number): string {
  if (progress >= 80) return 'var(--color-success)'
  if (progress >= 50) return 'var(--color-warning)'
  return 'var(--color-error)'
}

export function getStepStatus(step: OnboardingStep): 'completed' | 'current' | 'pending' {
  return step.completed ? 'completed' : 'current'
}