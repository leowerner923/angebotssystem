'use client'

import { SERVICES } from '@/lib/company-config'
import { Button } from '@/components/ui'
import type { WizardStepProps } from '@/lib/types/wizard'

export default function WizardStep1({ state, onChange, onNext }: WizardStepProps) {
  const canProceed = state.selectedServiceId !== null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Welche Leistung benötigen Sie?</h2>
        <p className="mt-1 text-sm text-gray-500">Wählen Sie die passende Reinigungsart aus.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SERVICES.map((service) => {
          const isSelected = state.selectedServiceId === service.id
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onChange({ selectedServiceId: service.id })}
              className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-[var(--brand-primary)] bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="block font-medium text-gray-900">{service.name}</span>
              <span className="mt-1 block text-sm text-gray-500">
                ab {service.price_per_unit.toFixed(2).replace('.', ',')} € / {service.unit}
              </span>
              {service.description && (
                <span className="mt-1 block text-xs text-gray-400">{service.description}</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed}>
          Weiter
        </Button>
      </div>
    </div>
  )
}
