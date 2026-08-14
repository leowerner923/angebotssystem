import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANY_CONFIG, TRUST_ITEMS, SERVICES } from '@/lib/company-config'
import LegalModals from './LegalModals'

const c = COMPANY_CONFIG
const beschreibung = `${c.name} – ${c.slogan ?? 'Professionelle Malerarbeiten'}${
  c.einzugsgebiet ? ` · ${c.einzugsgebiet}` : ''
}`
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

export const metadata: Metadata = {
  title: `${c.name} – Malerbetrieb in ${c.location}`,
  description: beschreibung,
  openGraph: {
    title: c.name,
    description: beschreibung,
    type: 'website',
    locale: 'de_DE',
    ...(siteUrl && { url: siteUrl }),
    ...(c.logoUrl && { images: [{ url: c.logoUrl }] }),
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: c.name,
  ...(c.telefon && { telephone: c.telefon }),
  ...(c.email && { email: c.email }),
  ...(c.adresse && { address: { '@type': 'PostalAddress', streetAddress: c.adresse } }),
  ...(c.einzugsgebiet && { areaServed: c.einzugsgebiet }),
  ...(siteUrl && { url: siteUrl }),
}

const TRUST_ICONS = [
  <svg key="uhr" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>,
  <svg key="pin" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>,
  <svg key="haken" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>,
]

function CtaButton({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/rechner"
      className="inline-block rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
      style={{ backgroundColor: COMPANY_CONFIG.primaryColor }}
    >
      {children}
    </Link>
  )
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <span className="text-lg font-bold text-gray-900">{c.name}</span>
        <Link
          href="/dashboard"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          Anmelden
        </Link>
      </header>

      {/* Kopfbereich */}
      <section className="flex flex-col items-center px-6 py-16 text-center sm:py-24">
        {c.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.logoUrl} alt={c.name} className="mb-6 h-16 w-auto object-contain sm:h-20" />
        )}

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">{c.name}</h1>

        {c.slogan && (
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-500 sm:text-xl">{c.slogan}</p>
        )}

        <div className="mt-10 flex flex-col items-center gap-3">
          <CtaButton>Angebot berechnen →</CtaButton>
          <span className="text-sm text-gray-400">Kostenlos · Unverbindlich · In 2 Minuten</span>
        </div>

        {/* Vertrauens-Zeile */}
        <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: c.primaryColor }}
              >
                {TRUST_ICONS[i]}
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leistungen */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-gray-900">Unsere Leistungen</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                {s.description && <p className="mt-1 text-sm leading-relaxed text-gray-500">{s.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Über uns */}
      {c.ueberUns && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-900">Über uns</h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              {c.ueberUns}
              {c.gruendungsjahr && ` Seit ${c.gruendungsjahr} für Sie da.`}
            </p>
          </div>
        </section>
      )}

      {/* Einzugsgebiet */}
      {c.einzugsgebiet && (
        <section className="border-t border-gray-100 bg-gray-50 px-6 py-10 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Einzugsgebiet</h2>
          <p className="mt-2 text-lg text-gray-700">{c.einzugsgebiet}</p>
        </section>
      )}

      {/* Kontakt */}
      {(c.telefon || c.email || c.adresse) && (
        <section className="px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Kontakt</h2>
          <div className="mt-6 flex flex-col items-center gap-2 text-lg">
            {c.telefon && (
              <a href={`tel:${c.telefon.replace(/\s+/g, '')}`} className="font-medium hover:underline" style={{ color: c.primaryColor }}>
                {c.telefon}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="font-medium hover:underline" style={{ color: c.primaryColor }}>
                {c.email}
              </a>
            )}
            {c.adresse && <p className="text-gray-500">{c.adresse}</p>}
          </div>
        </section>
      )}

      {/* Zweiter CTA */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-16 text-center">
        <CtaButton>Jetzt Angebot berechnen →</CtaButton>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-5 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} {c.name} · {c.location}</p>
        <LegalModals />
      </footer>
    </main>
  )
}
