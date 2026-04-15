import Link from 'next/link'
import { COMPANY_CONFIG } from '@/lib/company-config'

const TRUST_ITEMS = [
  {
    title: 'Schnelle Antwort',
    text: 'Angebot innerhalb von 24 Stunden – ohne langes Warten.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: 'Regionale Experten',
    text: `Spezialisiert auf ${COMPANY_CONFIG.location}. Wir kennen die Region.`,
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
  {
    title: 'Keine Vertragsbindung',
    text: 'Unverbindliches Angebot. Sie entscheiden, wann und ob.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
]

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <span className="text-lg font-bold text-gray-900">{COMPANY_CONFIG.name}</span>
        <Link
          href="/dashboard"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          Anmelden
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Professionelle Gebäudereinigung · {COMPANY_CONFIG.location}
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Reinigungsangebot
          <br className="hidden sm:block" />
          <span style={{ color: 'var(--brand-primary)' }}> in 2 Minuten</span>
        </h1>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-500">
          Preis berechnen, Anfrage senden – ohne Telefonieren.
          Wir melden uns innerhalb von 24 Stunden bei Ihnen.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/rechner"
            className="rounded-xl px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            Jetzt Angebot berechnen →
          </Link>
          <span className="text-sm text-gray-400">Kostenlos · Unverbindlich</span>
        </div>

        {/* Trust Badges */}
        <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Zielgruppen */}
        <div className="mt-16 flex flex-wrap justify-center gap-2">
          {COMPANY_CONFIG.targetGroups.map((group) => (
            <span
              key={group}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-500 shadow-sm"
            >
              {group}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-5 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {COMPANY_CONFIG.name} · {COMPANY_CONFIG.location}
      </footer>
    </main>
  )
}
