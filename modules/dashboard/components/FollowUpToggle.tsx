'use client'

import { useEffect, useState } from 'react'
import { COMPANY_CONFIG } from '@/lib/company-config'

export default function FollowUpToggle() {
  const [aktiv, setAktiv] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/company-settings?company_id=${COMPANY_CONFIG.id}`)
      .then((r) => r.json())
      .then((json) => setAktiv(json.follow_up_aktiv ?? false))
      .catch(() => setAktiv(false))
  }, [])

  async function toggeln() {
    if (aktiv === null || saving) return
    const neu = !aktiv
    setSaving(true)
    setAktiv(neu)
    try {
      await fetch('/api/company-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: COMPANY_CONFIG.id, follow_up_aktiv: neu }),
      })
    } finally {
      setSaving(false)
    }
  }

  if (aktiv === null) return null

  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">Automatische Nachfassung</p>
        <p className="text-xs text-gray-500">
          Erinnert Kunden bei versendeten, unentschiedenen Angeboten automatisch per Mail (max. 2×).
        </p>
      </div>
      <button
        onClick={toggeln}
        disabled={saving}
        role="switch"
        aria-checked={aktiv}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          aktiv ? 'bg-green-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            aktiv ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
