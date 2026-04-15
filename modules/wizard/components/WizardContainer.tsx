'use client'

import { useState } from 'react'
import { useWizardState } from '../hooks/useWizardState'
import { calculateEstimate } from '@/lib/pricing'
import { COMPANY_CONFIG } from '@/lib/company-config'
import { ProgressBar } from '@/components/ui'
import WizardStep1 from './WizardStep1'
import WizardStep2 from './WizardStep2'
import WizardStep3 from './WizardStep3'
import WizardStep4 from './WizardStep4'
import WizardSummary from './WizardSummary'
import WizardSuccess from './WizardSuccess'

const STEP_LABELS = ['Leistung', 'Details', 'Extras', 'Kontakt']

export default function WizardContainer() {
  const { state, updateState, nextStep, prevStep, reset } = useWizardState()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const estimate = calculateEstimate(state)

  async function handleSubmit() {
    setLoading(true)
    try {
      await fetch('/api/create-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: COMPANY_CONFIG.id, wizardState: state }),
      })
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    reset()
    setSubmitted(false)
  }

  if (submitted) {
    return <WizardSuccess onReset={handleReset} />
  }

  const stepProps = {
    state,
    onChange: updateState,
    onNext: state.currentStep < 4 ? nextStep : handleSubmit,
    onBack: prevStep,
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressBar currentStep={state.currentStep} totalSteps={4} stepLabels={STEP_LABELS} />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          {state.currentStep === 1 && <WizardStep1 {...stepProps} />}
          {state.currentStep === 2 && <WizardStep2 {...stepProps} />}
          {state.currentStep === 3 && <WizardStep3 {...stepProps} />}
          {state.currentStep === 4 && (
            <WizardStep4
              {...stepProps}
              onNext={loading ? () => {} : handleSubmit}
              loading={loading}
            />
          )}
        </div>

        {state.selectedServiceId && (
          <div className="lg:w-72">
            <WizardSummary state={state} estimate={estimate} />
          </div>
        )}
      </div>
    </div>
  )
}
