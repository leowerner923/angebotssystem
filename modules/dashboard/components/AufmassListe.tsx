'use client'

import { useEffect, useState } from 'react'
import { COMPANY_CONFIG } from '@/lib/company-config'
import type { Aufmass, AufmassStatus } from '@/lib/types/aufmass'

const STATUS_LABELS: Record<AufmassStatus, string> = {
  entwurf: 'Entwurf',
  uebernommen: 'Übernommen',
  verworfen: 'Verworfen',
}

const STATUS_COLORS: Record<AufmassStatus, string> = {
  entwurf: 'bg-amber-100 text-amber-700',
  uebernommen: 'bg-green-100 text-green-700',
  verworfen: 'bg-gray-100 text-gray-500',
}

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AufmassListe({
  refreshTrigger,
  onFortsetzen,
}: {
  refreshTrigger: number
  onFortsetzen: (aufmass: Aufmass) => void
}) {
  const [aufmasse, setAufmasse] = useState<Aufmass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/get-aufmasse?company_id=${COMPANY_CONFIG.id}`)
      .then((r) => r.json())
      .then((json) => setAufmasse(json.aufmasse ?? []))
      .catch(() => setAufmasse([]))
      .finally(() => setLoading(false))
  }, [refreshTrigger])

  if (loading) {
    return <p className="mt-6 text-sm text-gray-400">Lädt…</p>
  }

  if (aufmasse.length === 0) {
    return <p className="mt-6 text-sm text-gray-400">Noch keine Aufmaße vorhanden.</p>
  }

  return (
    <div className="mt-6 max-w-2xl overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Datum</th>
            <th className="px-4 py-3">Raum</th>
            <th className="px-4 py-3">Leistung</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {aufmasse.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3 text-xs text-gray-400">{formatDatum(a.erstellt_am)}</td>
              <td className="px-4 py-3 text-gray-700">{a.strukturiert?.raum ?? '—'}</td>
              <td className="px-4 py-3 text-gray-700">{a.strukturiert?.leistung ?? '—'}</td>
              <td className="px-4 py-3">
                <span className={`rounded px-2 py-1 text-xs ${STATUS_COLORS[a.status as AufmassStatus]}`}>
                  {STATUS_LABELS[a.status as AufmassStatus] ?? a.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {a.status === 'entwurf' && (
                  <button onClick={() => onFortsetzen(a)} className="text-xs text-blue-600 hover:underline">
                    Fortsetzen
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
