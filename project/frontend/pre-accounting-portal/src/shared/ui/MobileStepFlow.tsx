import type { ReactNode } from 'react'

export type MobileStep = {
  key: string
  label: string
}

type MobileStepFlowProps = {
  steps: MobileStep[]
  activeStep: string
  onStepChange: (step: string) => void
  children: ReactNode
}

export function MobileStepFlow({ steps, activeStep, onStepChange, children }: MobileStepFlowProps) {
  return (
    <div className="mobile-step-flow">
      <div className="step-tabs" role="tablist" aria-label="İşlem adımları">
        {steps.map((step, index) => (
          <button
            key={step.key}
            type="button"
            className={step.key === activeStep ? 'step-tab active' : 'step-tab'}
            onClick={() => onStepChange(step.key)}
          >
            <span>{index + 1}</span>
            {step.label}
          </button>
        ))}
      </div>
      <div className="step-panel">{children}</div>
    </div>
  )
}
