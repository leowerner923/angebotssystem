'use client'

import { useState } from 'react'

export default function Entscheidung({ token }: { token: string }) {
  const [status, setStatus] = useState<'offen' | 'angenommen' | 'abgelehnt'>('offen')
  const [ladend, setLadend] = useState<'angenommen' | 'abgelehnt' | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  async function entscheiden(entscheidung: 'angenommen' | 'abgelehnt') {
    setLadend(entscheidung)
    setFehler(null)
    try {
      const res = await fetch('/api/offer-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, entscheidung }),
      })
      const json = await res.json()
      if (!res.ok) {
        setFehler(json.error ?? 'Das hat leider nicht funktioniert. Bitte versuchen Sie es erneut.')
        return
      }
      setStatus(entscheidung)
    } catch {
      setFehler('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLadend(null)
    }
  }

  if (status === 'angenommen') {
    return (
      <div className="rounded-2xl bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">Danke!</p>
        <p className="mt-1 text-sm text-green-700">Der Betrieb meldet sich zur Terminabstimmung.</p>
      </div>
    )
  }

  if (status === 'abgelehnt') {
    return (
      <div className="rounded-2xl bg-gray-50 p-6 text-center">
        <p className="text-lg font-semibold text-gray-800">Danke für Ihre Rückmeldung.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {fehler && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{fehler}</p>
      )}
      <button
        onClick={() => entscheiden('angenommen')}
        disabled={ladend !== null}
        className="w-full rounded-xl bg-green-600 py-4 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {ladend === 'angenommen' ? 'Wird gesendet…' : 'Angebot annehmen'}
      </button>
      <button
        onClick={() => entscheiden('abgelehnt')}
        disabled={ladend !== null}
        className="w-full rounded-xl border border-gray-300 bg-white py-4 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        {ladend === 'abgelehnt' ? 'Wird gesendet…' : 'Ablehnen'}
      </button>
    </div>
  )
}
