'use client'

import Link from 'next/link'
import { useState } from 'react'
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

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <h2 className="mb-6 text-xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm leading-relaxed text-gray-600">{children}</div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [modal, setModal] = useState<'impressum' | 'datenschutz' | null>(null)

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Modals */}
      {modal === 'impressum' && (
        <Modal title="Impressum" onClose={() => setModal(null)}>
          <p className="font-semibold">Angaben gemäß § 5 TMG</p>
          <p className="mt-2">Leonard Werner<br />Odenwaldstraße 3<br />74850 Schefflenz</p>
          <p className="mt-4 font-semibold">Kontakt</p>
          <p className="mt-2">E-Mail: leowerner923@gmail.com</p>
          <p className="mt-4 text-gray-400 text-xs">Diese Website befindet sich derzeit in der Entwicklungsphase und wird gewerblich noch nicht betrieben.</p>
        </Modal>
      )}

      {modal === 'datenschutz' && (
        <Modal title="Datenschutzerklärung" onClose={() => setModal(null)}>
          <p className="font-semibold">1. Verantwortlicher</p>
          <p className="mt-2">Leonard Werner, Odenwaldstraße 3, 74850 Schefflenz<br />E-Mail: leowerner923@gmail.com</p>

          <p className="mt-4 font-semibold">2. Welche Daten wir erheben</p>
          <p className="mt-2">Wenn Sie unser Anfrageformular nutzen, erheben wir: Name, E-Mail-Adresse, Telefonnummer, Standort sowie Angaben zur gewünschten Leistung.</p>

          <p className="mt-4 font-semibold">3. Zweck der Datenverarbeitung</p>
          <p className="mt-2">Die Daten werden ausschließlich zur Erstellung und Übermittlung eines unverbindlichen Angebots verwendet.</p>

          <p className="mt-4 font-semibold">4. Speicherung</p>
          <p className="mt-2">Ihre Daten werden auf Servern von Supabase (supabase.com) gespeichert. Supabase ist DSGVO-konform und speichert Daten in der EU.</p>

          <p className="mt-4 font-semibold">5. Weitergabe an Dritte</p>
          <p className="mt-2">Ihre Daten werden nicht an Dritte weitergegeben, außer an den jeweiligen Handwerksbetrieb zur Angebotserstellung.</p>

          <p className="mt-4 font-semibold">6. Ihre Rechte</p>
          <p className="mt-2">Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Kontaktieren Sie uns per E-Mail.</p>

          <p className="mt-4 font-semibold">7. Hosting & Dienste</p>
          <p className="mt-2">Hosting: Vercel (vercel.com) · E-Mail-Versand: Resend (resend.com)</p>
        </Modal>
      )}

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
        <p>© {new Date().getFullYear()} {COMPANY_CONFIG.name} · {COMPANY_CONFIG.location}</p>
        <div className="mt-2 flex justify-center gap-4">
          <button
            onClick={() => setModal('impressum')}
            className="hover:text-gray-600 underline"
          >
            Impressum
          </button>
          <button
            onClick={() => setModal('datenschutz')}
            className="hover:text-gray-600 underline"
          >
            Datenschutz
          </button>
        </div>
      </footer>
    </main>
  )
}