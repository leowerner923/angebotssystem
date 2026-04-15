'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { validateCity } from '@/lib/geo'
import type { WizardStepProps } from '@/lib/types/wizard'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface WizardStep4Props extends WizardStepProps {
  loading?: boolean
}

export default function WizardStep4({ state, onChange, onNext, onBack, loading }: WizardStep4Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!state.contactName.trim()) {
      newErrors.contactName = 'Bitte geben Sie Ihren Namen an.'
    }
    if (!state.contactEmail.trim()) {
      newErrors.contactEmail = 'Bitte geben Sie Ihre E-Mail-Adresse an.'
    } else if (!EMAIL_REGEX.test(state.contactEmail)) {
      newErrors.contactEmail = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
    }
    if (!state.contactPhone.trim()) {
      newErrors.contactPhone = 'Bitte geben Sie Ihre Telefonnummer an.'
    }
    if (!state.city.trim()) {
      newErrors.city = 'Bitte geben Sie Ihren Ort an.'
    } else {
      const result = validateCity(state.city)
      if (!result.valid) {
        newErrors.city =
          result.reason === 'not_found'
            ? 'Ort nicht gefunden. Bitte prüfen Sie die Schreibweise.'
            : `Dieser Ort liegt außerhalb unseres Einzugsgebiets (50 km um Mosbach, aktuell ${result.distanceKm} km).`
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
        <h2 className="text-lg font-semibold text-gray-900">Ihre Kontaktdaten</h2>
        <p className="mt-1 text-sm text-gray-500">
          Wir melden uns schnellstmöglich bei Ihnen.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          name="contactName"
          value={state.contactName}
          onChange={(v) => onChange({ contactName: v })}
          error={errors.contactName}
          placeholder="Max Mustermann"
          required
        />
        <Input
          label="E-Mail"
          name="contactEmail"
          type="email"
          value={state.contactEmail}
          onChange={(v) => onChange({ contactEmail: v })}
          error={errors.contactEmail}
          placeholder="max@beispiel.de"
          required
        />
        <Input
          label="Telefon"
          name="contactPhone"
          type="tel"
          value={state.contactPhone}
          onChange={(v) => onChange({ contactPhone: v })}
          error={errors.contactPhone}
          placeholder="+49 6261 ..."
          required
        />
        <Input
          label="Firma (optional)"
          name="contactCompany"
          value={state.contactCompany}
          onChange={(v) => onChange({ contactCompany: v })}
          placeholder="Musterfirma GmbH"
        />
        <Input
          label="Ihr Ort"
          name="city"
          value={state.city}
          onChange={(v) => onChange({ city: v })}
          error={errors.city}
          placeholder="z. B. Mosbach"
          required
        />
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Zurück
        </Button>
        <Button onClick={handleNext} loading={loading} disabled={loading}>
          {loading ? 'Wird gesendet…' : 'Angebot anfordern'}
        </Button>
      </div>
    </div>
  )
}
