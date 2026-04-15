'use client'

import { Button, Card } from '@/components/ui'
import { COMPANY_CONFIG } from '@/lib/company-config'

interface WizardSuccessProps {
  onReset: () => void
}

const NEXT_STEPS = [
  { step: '1', text: 'Wir prüfen Ihre Anfrage sorgfältig.' },
  { step: '2', text: 'Ihr persönliches Angebot wird erstellt.' },
  { step: '3', text: 'Rückmeldung innerhalb von 24 Stunden.' },
]

export default function WizardSuccess({ onReset }: WizardSuccessProps) {
  return (
    <Card padding="lg" className="text-center">
      {/* Icon */}
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">Anfrage erhalten!</h2>
      <p className="mt-2 text-gray-500">
        Vielen Dank. Das Team von{' '}
        <strong className="text-gray-700">{COMPANY_CONFIG.name}</strong>{' '}
        meldet sich so bald wie möglich bei Ihnen.
      </p>

      {/* Next Steps */}
      <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-5 text-left">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Was passiert als nächstes?
        </p>
        <ol className="space-y-3">
          {NEXT_STEPS.map(({ step, text }) => (
            <li key={step} className="flex items-start gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                {step}
              </span>
              <span className="text-sm text-gray-600">{text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6">
        <Button variant="secondary" onClick={onReset}>
          Neue Anfrage stellen
        </Button>
      </div>
    </Card>
  )
}
