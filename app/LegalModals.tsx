'use client'

import { useState } from 'react'

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          ✕
        </button>
        <h2 className="mb-6 text-xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm leading-relaxed text-gray-600">{children}</div>
      </div>
    </div>
  )
}

export default function LegalModals() {
  const [modal, setModal] = useState<'impressum' | 'datenschutz' | null>(null)

  return (
    <>
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

      <div className="mt-2 flex justify-center gap-4">
        <button onClick={() => setModal('impressum')} className="hover:text-gray-600 underline">
          Impressum
        </button>
        <button onClick={() => setModal('datenschutz')} className="hover:text-gray-600 underline">
          Datenschutz
        </button>
      </div>
    </>
  )
}
