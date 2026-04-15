'use client'

import { useState, useCallback } from 'react'
import type { WizardState, WizardStep } from '@/lib/types/wizard'

const INITIAL_STATE: WizardState = {
  currentStep: 1,
  selectedServiceId: null,
  areaM2: null,
  windowCount: null,
  floorCount: null,
  cleaningInterval: null,
  dirtLevel: 'normal',
  selectedExtras: [],
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactCompany: '',
  city: 'Mosbach',
  radius_km: 50,
}

export function useWizardState() {
  const [state, setState] = useState<WizardState>(INITIAL_STATE)

  const updateState = useCallback((partial: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }, [])

  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }))
  }, [])

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4) as WizardStep,
    }))
  }, [])

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1) as WizardStep,
    }))
  }, [])

  const reset = useCallback(() => setState(INITIAL_STATE), [])

  return { state, updateState, goToStep, nextStep, prevStep, reset }
}
