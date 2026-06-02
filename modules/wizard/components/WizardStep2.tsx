'use client'

import { useState } from 'react'
import { SERVICES } from '@/lib/company-config'
import { Button, Input } from '@/components/ui'
import type { WizardStepProps } from '@/lib/types/wizard'

export default function WizardStep2({ state, onChange, onNext, onBack }: WizardStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const service = SERVICES.find((s) => s.id === state.selectedServiceId)
  const isPerUnit = service?.pricing_type === 'per_unit'

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (isPerUnit) {
      if (!state.windowCount || state.windowCount <= 0) {
        newErrors.windowCount = 'Bitte geben Sie die Anzahl an.'
      }
    } else {
      if (!state.areaM2 || state.areaM2 <= 0) {
        newErrors.areaM2 = 'Bitte geben Sie eine Fläche größer als 0 an.'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Details zu den Malerarbeiten</h2>
        <p className="mt-1 text-sm text-gray-500">
          {service ? `Leistung: ${service.name}` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {isPerUnit ? (
          <Input
            label="Anzahl"
            name="windowCount"
            type="number"
            value={state.windowCount ?? ''}
            onChange={(v) => onChange({ windowCount: Number(v) || null })}
            error={errors.windowCount}
            placeholder="z. B. 10"
            required
            min={1}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Fläche in m²<span className="ml-1 text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={1000}
                step={1}
                value={state.areaM2 ?? 0}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  onChange({ areaM2: val > 0 ? val : null })
                }}
                className="w-full cursor-pointer accent-[var(--brand-primary)]"
              />
              <input
                type="number"
                min={0}
                value={state.areaM2 ?? ''}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  onChange({ areaM2: val > 0 ? val : null })
                }}
                className="w-20 shrink-0 rounded-lg border border-gray-200 px-2 py-1 text-right text-sm font-semibold text-gray-900 outline-none focus:border-blue-400"
              />
              <span className="shrink-0 text-sm text-gray-500">m²</span>
            </div>
            {errors.areaM2 && <p className="text-xs text-red-500">{errors.areaM2}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Zurück
        </Button>
        <Button onClick={handleNext}>Weiter</Button>
      </div>
    </div>
  )
}