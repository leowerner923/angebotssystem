export type WizardStep = 1 | 2 | 3 | 4

export interface WizardState {
  currentStep: WizardStep
  // Step 1
  selectedServiceId: string | null
  // Step 2
  areaM2: number | null
  windowCount: number | null
  floorCount: number | null
  cleaningInterval: 'weekly' | 'biweekly' | 'monthly' | 'once' | null
  dirtLevel: 'normal' | 'heavy'
  // Step 3
  selectedExtras: string[]
  // Step 4
  contactName: string
  contactEmail: string
  contactPhone: string
  contactCompany: string
  // Standort (fix, kein User-Input)
  city: string
  radius_km: number
}

export interface WizardStepProps {
  state: WizardState
  onChange: (partial: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
}

export interface PriceEstimate {
  base: number
  extras: number
  total: number
  currency: 'EUR'
}
