import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANY_CONFIG } from '@/lib/company-config'
import WizardContainer from '@/modules/wizard/components/WizardContainer'

export const metadata: Metadata = {
  title: `Angebot berechnen – ${COMPANY_CONFIG.name}`,
  description: `Berechnen Sie in 2 Minuten den Preis für Ihre Reinigung bei ${COMPANY_CONFIG.name}.`,
}

export default function RechnerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {COMPANY_CONFIG.name}
          </Link>
          <span className="text-xs text-gray-400">Kostenlos · Unverbindlich</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Ihr Angebot in 2 Minuten</h1>
          <p className="mt-1 text-sm text-gray-500">
            Füllen Sie die folgenden Schritte aus – wir melden uns innerhalb von 24 Stunden.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <WizardContainer />
        </div>
      </main>
    </div>
  )
}
