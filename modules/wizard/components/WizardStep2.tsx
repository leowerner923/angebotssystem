'use client'

import { useState } from 'react'
import { SERVICES } from '@/lib/company-config'
import { Button, Input, Select } from '@/components/ui'
import type { WizardStepProps } from '@/lib/types/wizard'

const INTERVAL_OPTIONS = [
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'biweekly', label: 'Alle 2 Wochen' },
  { value: 'monthly', label: 'Monatlich' },
  { value: 'once', label: 'Einmalig' },
]

const DIRT_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'heavy', label: 'Stark verschmutzt' },
]

export default function WizardStep2({ state, onChange, onNext, onBack }: WizardStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const service = SERVICES.find((s) => s.id === state.selectedServiceId)
  const isPerUnit = service?.pricing_type === 'per_unit'

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (isPerUnit) {
      if (!state.windowCount || state.windowCount <= 0) {
        newErrors.windowCount = 'Bitte geben Sie die Anzahl der Fenster an.'
      }
    } else {
      if (!state.areaM2 || state.areaM2 <= 0) {
        newErrors.areaM2 = 'Bitte geben Sie eine Fläche größer als 0 an.'
      }
    }
    if (!state.cleaningInterval) {
      newErrors.cleaningInterval = 'Bitte wählen Sie ein Intervall.'
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
        <h2 className="text-lg font-semibold text-gray-900">Details zur Reinigung</h2>
        <p className="mt-1 text-sm text-gray-500">
          {service ? `Leistung: ${service.name}` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {isPerUnit ? (
          <>
            <Input
              label="Anzahl Fenster"
              name="windowCount"
              type="number"
              value={state.windowCount ?? ''}
              onChange={(v) => onChange({ windowCount: Number(v) || null })}
              error={errors.windowCount}
              placeholder="z. B. 10"
              required
              min={1}
            />
            <Input
              label="Anzahl Etagen"
              name="floorCount"
              type="number"
              value={state.floorCount ?? ''}
              onChange={(v) => onChange({ floorCount: Number(v) || null })}
              placeholder="z. B. 2"
              min={1}
            />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Fläche in m²<span className="ml-1 text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={10}
                  value={state.areaM2 ?? 0}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    onChange({ areaM2: val > 0 ? val : null })
                  }}
                  className="w-full cursor-pointer accent-[var(--brand-primary)]"
                />
                <span className="w-20 shrink-0 text-right text-sm font-semibold text-gray-900">
                  {state.areaM2 ?? 0} m²
                </span>
              </div>
              {errors.areaM2 && <p className="text-xs text-red-500">{errors.areaM2}</p>}
            </div>
            <Select
              label="Verschmutzungsgrad"
              name="dirtLevel"
              value={state.dirtLevel}
              options={DIRT_OPTIONS}
              onChange={(v) => onChange({ dirtLevel: v as 'normal' | 'heavy' })}
            />
          </>
        )}

        <Select
          label="Reinigungsintervall"
          name="cleaningInterval"
          value={state.cleaningInterval ?? ''}
          options={INTERVAL_OPTIONS}
          onChange={(v) =>
            onChange({ cleaningInterval: v as 'weekly' | 'biweekly' | 'monthly' | 'once' })
          }
          error={errors.cleaningInterval}
          required
        />
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
