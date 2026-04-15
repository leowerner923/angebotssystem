'use client'

import { EXTRA_SERVICES } from '@/lib/company-config'
import { Button, Checkbox } from '@/components/ui'
import type { WizardStepProps } from '@/lib/types/wizard'

export default function WizardStep3({ state, onChange, onNext, onBack }: WizardStepProps) {
  function toggleExtra(id: string) {
    const current = state.selectedExtras
    const updated = current.includes(id) ? current.filter((e) => e !== id) : [...current, id]
    onChange({ selectedExtras: updated })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Zusatzleistungen</h2>
        <p className="mt-1 text-sm text-gray-500">
          Optional – wählen Sie weitere Leistungen aus.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {EXTRA_SERVICES.map((extra) => (
          <Checkbox
            key={extra.id}
            label={extra.name}
            name={extra.id}
            checked={state.selectedExtras.includes(extra.id)}
            onChange={() => toggleExtra(extra.id)}
            description={`${extra.price_per_unit.toFixed(2).replace('.', ',')} € / ${extra.unit}${extra.description ? ` – ${extra.description}` : ''}`}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Zurück
        </Button>
        <Button onClick={onNext}>Weiter</Button>
      </div>
    </div>
  )
}
