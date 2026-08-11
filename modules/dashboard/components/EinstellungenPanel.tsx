'use client'

import { useEffect, useState } from 'react'
import { COMPANY_CONFIG } from '@/lib/company-config'
import type { CompanySettings } from '@/lib/types/settings'

function Switch({
  aktiv,
  disabled,
  onToggle,
}: {
  aktiv: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      role="switch"
      aria-checked={aktiv}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        aktiv ? 'bg-green-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          aktiv ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function EinstellungenPanel() {
  const [settings, setSettings] = useState<Omit<CompanySettings, 'company_id'> | null>(null)
  const [urlEntwurf, setUrlEntwurf] = useState('')
  const [urlFehler, setUrlFehler] = useState<string | null>(null)
  const [speichertUrl, setSpeichertUrl] = useState(false)
  const [saving, setSaving] = useState<'follow_up' | 'bewertung' | null>(null)

  useEffect(() => {
    fetch(`/api/company-settings?company_id=${COMPANY_CONFIG.id}`)
      .then((r) => r.json())
      .then((json) => {
        setSettings({
          follow_up_aktiv: json.follow_up_aktiv ?? false,
          google_bewertung_url: json.google_bewertung_url ?? null,
          bewertung_aktiv: json.bewertung_aktiv ?? false,
        })
        setUrlEntwurf(json.google_bewertung_url ?? '')
      })
      .catch(() =>
        setSettings({ follow_up_aktiv: false, google_bewertung_url: null, bewertung_aktiv: false })
      )
  }, [])

  async function toggleFollowUp() {
    if (!settings || saving) return
    const neu = !settings.follow_up_aktiv
    setSaving('follow_up')
    setSettings({ ...settings, follow_up_aktiv: neu })
    try {
      await fetch('/api/company-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: COMPANY_CONFIG.id, follow_up_aktiv: neu }),
      })
    } finally {
      setSaving(null)
    }
  }

  async function urlSpeichern() {
    setUrlFehler(null)
    const wert = urlEntwurf.trim()
    if (wert && !wert.startsWith('https://')) {
      setUrlFehler('Bitte eine gültige https://-URL angeben.')
      return
    }
    setSpeichertUrl(true)
    try {
      const res = await fetch('/api/company-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: COMPANY_CONFIG.id, google_bewertung_url: wert || null }),
      })
      const json = await res.json()
      if (!res.ok) {
        setUrlFehler(json.error ?? 'Konnte nicht gespeichert werden.')
        return
      }
      setSettings((prev) => (prev ? { ...prev, google_bewertung_url: json.google_bewertung_url } : prev))
    } finally {
      setSpeichertUrl(false)
    }
  }

  async function toggleBewertung() {
    if (!settings || saving || !settings.google_bewertung_url) return
    const neu = !settings.bewertung_aktiv
    setSaving('bewertung')
    try {
      const res = await fetch('/api/company-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: COMPANY_CONFIG.id, bewertung_aktiv: neu }),
      })
      const json = await res.json()
      if (res.ok) {
        setSettings({ ...settings, bewertung_aktiv: json.bewertung_aktiv })
      }
    } finally {
      setSaving(null)
    }
  }

  if (!settings) return null

  return (
    <div className="mb-4 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-900">Einstellungen</p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">Automatische Nachfassung</p>
          <p className="text-xs text-gray-500">
            Erinnert Kunden bei versendeten, unentschiedenen Angeboten automatisch per Mail (max. 2×).
          </p>
        </div>
        <Switch aktiv={settings.follow_up_aktiv} disabled={saving === 'follow_up'} onToggle={toggleFollowUp} />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-800">Google-Bewertungslink</p>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={urlEntwurf}
            onChange={(e) => setUrlEntwurf(e.target.value)}
            placeholder="https://g.page/r/.../review"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
          <button
            onClick={urlSpeichern}
            disabled={speichertUrl}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {speichertUrl ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
        {urlFehler && <p className="mt-1 text-xs text-red-500">{urlFehler}</p>}
        <p className="mt-2 text-xs text-gray-400">
          Im Google-Unternehmensprofil unter „Rezensionen" gibt es die Funktion „Rezensionen erhalten" bzw. einen
          Link zum Teilen. Diesen Link hier einfügen — er öffnet beim Kunden direkt die Bewertungsmaske.
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Automatisch nach Bewertung fragen</p>
            <p className="text-xs text-gray-500">
              Fragt Kunden ein paar Tage nach Auftragsabschluss einmalig nach einer Google-Bewertung.
              {!settings.google_bewertung_url && ' Erst nach Speichern eines Bewertungslinks aktivierbar.'}
            </p>
          </div>
          <Switch
            aktiv={settings.bewertung_aktiv}
            disabled={saving === 'bewertung' || !settings.google_bewertung_url}
            onToggle={toggleBewertung}
          />
        </div>
      </div>
    </div>
  )
}
