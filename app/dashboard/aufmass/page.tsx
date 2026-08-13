'use client'

import { useState } from 'react'
import { COMPANY_CONFIG } from '@/lib/company-config'
import AufmassRecorder from '@/modules/dashboard/components/AufmassRecorder'
import AufmassFormular from '@/modules/dashboard/components/AufmassFormular'
import AufmassListe from '@/modules/dashboard/components/AufmassListe'
import type { Aufmass } from '@/lib/types/aufmass'

export default function AufmassPage() {
  const [aktuelles, setAktuelles] = useState<Aufmass | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  function reset(text: string) {
    setAktuelles(null)
    setMeldung(text)
    setRefreshTrigger((n) => n + 1)
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-gray-900">Aufmaß per Sprachnachricht</h1>
      <p className="mt-1 text-sm text-gray-500">
        Aufnehmen, direkt vor Ort — {COMPANY_CONFIG.name} wertet die Angaben automatisch aus.
      </p>

      {meldung && (
        <p className="mt-4 max-w-md rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{meldung}</p>
      )}

      {!aktuelles && (
        <div className="mt-6 max-w-md">
          <AufmassRecorder
            onAusgewertet={(a) => {
              setMeldung(null)
              setAktuelles(a)
              setRefreshTrigger((n) => n + 1)
            }}
          />
        </div>
      )}

      {aktuelles && (
        <div className="mt-6 max-w-md">
          <AufmassFormular
            aufmass={aktuelles}
            onUebernommen={() => reset('Anfrage wurde angelegt.')}
            onVerworfen={() => reset('Aufmaß verworfen.')}
          />
        </div>
      )}

      <AufmassListe
        refreshTrigger={refreshTrigger}
        onFortsetzen={(a) => {
          setMeldung(null)
          setAktuelles(a)
        }}
      />
    </>
  )
}
