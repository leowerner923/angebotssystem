'use client'

import { Card } from '@/components/ui'
import { SERVICES } from '@/lib/company-config'
import type { WizardState, PriceEstimate } from '@/lib/types/wizard'

interface WizardSummaryProps {
  state: WizardState
  estimate: PriceEstimate
}

export default function WizardSummary({ state, estimate }: WizardSummaryProps) {
  const service = SERVICES.find((s) => s.id === state.selectedServiceId)
  const extraServices = SERVICES.filter((s) => state.selectedExtras.includes(s.id))

  return (
    <Card padding="md" className="sticky top-4">
      <h3 className="font-semibold text-gray-900">Ihre Auswahl</h3>

      <div className="mt-4 space-y-3 text-sm">
        {service ? (
          <div className="flex justify-between">
            <span className="text-gray-600">{service.name}</span>
            <span className="font-medium">
              {estimate.base.toFixed(2).replace('.', ',')} €
            </span>
          </div>
        ) : (
          <p className="text-gray-400 italic">Noch keine Leistung gewählt</p>
        )}

        {state.areaM2 && (
          <div className="flex justify-between text-gray-500">
            <span>Fläche</span>
            <span>{state.areaM2} m²</span>
          </div>
        )}

        {extraServices.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Extras</p>
            {extraServices.map((extra) => (
              <div key={extra.id} className="mt-2 flex justify-between text-gray-600">
                <span>{extra.name}</span>
                <span>{estimate.extras > 0 ? `+ inkl.` : '—'}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between text-gray-500">
          <span>Standort</span>
          <span>{state.city} + {state.radius_km} km Umkreis</span>
        </div>
      </div>

      {estimate.total > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-900">Schätzung gesamt</span>
            <span className="text-lg font-bold text-[var(--brand-primary)]">
              {estimate.total.toFixed(2).replace('.', ',')} €
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Unverbindliche Schätzung. Das finale Angebot erhalten Sie nach Prüfung.
          </p>
        </div>
      )}
    </Card>
  )
}