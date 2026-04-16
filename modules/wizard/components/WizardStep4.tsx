'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { validatePlz } from '@/lib/geo'
import type { WizardStepProps } from '@/lib/types/wizard'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface WizardStep4Props extends WizardStepProps {
  loading?: boolean
}

export default function WizardStep4({ state, onChange, onNext, onBack, loading }: WizardStep4Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [plz, setPlz] = useState('')
  const [cityName, setCityName] = useState(state.city ?? '')
  const [plzLoading, setPlzLoading] = useState(false)
  const [plzValid, setPlzValid] = useState<boolean | null>(null)

  async function handlePlzChange(value: string) {
    setPlz(value)
    setPlzValid(null)
    setCityName('')
    onChange({ city: '' })

    if (value.length === 5) {
      setPlzLoading(true)
      const result = await validatePlz(value)
      setPlzLoading(false)

      if (result.valid) {
        setCityName(result.city)
        onChange({ city: result.city })
        setPlzValid(true)
        setErrors((prev) => ({ ...prev, city: '' }))
      } else if (result.reason === 'too_far') {
        setCityName(result.city)
        setPlzValid(false)
        setErrors((prev) => ({
          ...prev,
          city: `${result.city} liegt außerhalb unseres Einzugsgebiets (${result.distanceKm} km, max. 50 km).`,
        }))
      } else {
        setPlzValid(false)
        setErrors((prev) => ({
          ...prev,
          city: 'PLZ nicht gefunden. Bitte prüfen Sie Ihre Eingabe.',
        }))
      }
    }
  }

  async function validate(): Promise<boolean> {
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
    if (plz.length !== 5) {
      newErrors.city = 'Bitte geben Sie eine gültige 5-stellige PLZ an.'
    } else if (!plzValid) {
      newErrors.city = errors.city || 'Diese PLZ liegt außerhalb unseres Einzugsgebiets.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleNext() {
    const valid = await validate()
    if (valid) onNext()
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

        {/* PLZ Eingabe */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Postleitzahl <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={5}
              value={plz}
              onChange={(e) => handlePlzChange(e.target.value.replace(/\D/g, ''))}
              placeholder="z. B. 74821"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors ${
                plzValid === true
                  ? 'border-green-400 bg-green-50'
                  : plzValid === false
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 bg-white focus:border-blue-400'
              }`}
            />
            {plzLoading && (
              <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                Suche...
              </span>
            )}
            {plzValid === true && !plzLoading && (
              <span className="absolute right-3 top-2.5 text-green-500">✓</span>
            )}
          </div>

          {/* Ort wird automatisch angezeigt */}
          {cityName && (
            <p className={`text-sm mt-1 ${plzValid ? 'text-green-600' : 'text-red-600'}`}>
              {plzValid ? `✓ ${cityName}` : `✗ ${cityName}`}
            </p>
          )}

          {errors.city && (
            <p className="text-xs text-red-500 mt-1">{errors.city}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Zurück
        </Button>
        <Button onClick={handleNext} loading={loading} disabled={loading || plzLoading}>
          {loading ? 'Wird gesendet…' : 'Angebot anfordern'}
        </Button>
      </div>
    </div>
  )
}