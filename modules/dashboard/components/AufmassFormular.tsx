'use client'

import { useState } from 'react'
import { COMPANY_CONFIG, SERVICES } from '@/lib/company-config'
import type { Aufmass, AufmassStrukturiert } from '@/lib/types/aufmass'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function leerFeldKlasse(leer: boolean) {
  return leer ? 'border-amber-300 bg-amber-50' : 'border-gray-300 bg-white'
}

export default function AufmassFormular({
  aufmass,
  onUebernommen,
  onVerworfen,
}: {
  aufmass: Aufmass
  onUebernommen: () => void
  onVerworfen: () => void
}) {
  const s: AufmassStrukturiert = aufmass.strukturiert ?? {
    raum: null,
    leistung: null,
    flaeche_m2: null,
    wandhoehe_m: null,
    untergrund: null,
    anstriche: null,
    decke_inklusive: null,
    hinweise: [],
    unklar: [],
  }

  const [raum, setRaum] = useState(s.raum ?? '')
  const [leistungId, setLeistungId] = useState(SERVICES.find((sv) => sv.name === s.leistung)?.id ?? '')
  const [flaeche, setFlaeche] = useState(s.flaeche_m2?.toString() ?? '')
  const [wandhoehe, setWandhoehe] = useState(s.wandhoehe_m?.toString() ?? '')
  const [untergrund, setUntergrund] = useState(s.untergrund ?? '')
  const [anstriche, setAnstriche] = useState(s.anstriche?.toString() ?? '')
  const [deckeInklusive, setDeckeInklusive] = useState(s.decke_inklusive ?? false)

  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [city, setCity] = useState('')

  const [fehler, setFehler] = useState<Record<string, string>>({})
  const [speichert, setSpeichert] = useState<'uebernehmen' | 'verwerfen' | null>(null)
  const [serverFehler, setServerFehler] = useState<string | null>(null)

  function validiere(): boolean {
    const neu: Record<string, string> = {}
    if (!leistungId) neu.leistungId = 'Bitte eine Leistung wählen.'
    if (!contactName.trim()) neu.contactName = 'Pflichtfeld'
    if (!contactEmail.trim() || !EMAIL_REGEX.test(contactEmail)) neu.contactEmail = 'Gültige E-Mail nötig'
    if (!contactPhone.trim()) neu.contactPhone = 'Pflichtfeld'
    setFehler(neu)
    return Object.keys(neu).length === 0
  }

  function baueNotizen(): string {
    const teile: string[] = []
    if (raum) teile.push(`Raum: ${raum}`)
    if (wandhoehe) teile.push(`Wandhöhe: ${wandhoehe} m`)
    if (untergrund) teile.push(`Untergrund: ${untergrund}`)
    if (anstriche) teile.push(`Anstriche: ${anstriche}`)
    teile.push(`Decke inklusive: ${deckeInklusive ? 'ja' : 'nein'}`)
    if (s.hinweise.length > 0) teile.push(`Hinweise: ${s.hinweise.join('; ')}`)
    if (s.unklar.length > 0) teile.push(`Nicht sicher erkannt: ${s.unklar.join('; ')}`)
    teile.push('(per Sprachaufmaß erfasst)')
    return teile.join('\n')
  }

  async function uebernehmen() {
    if (!validiere()) return
    setSpeichert('uebernehmen')
    setServerFehler(null)
    try {
      const res = await fetch('/api/create-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: COMPANY_CONFIG.id,
          wizardState: {
            selectedServiceId: leistungId,
            areaM2: flaeche ? Number(flaeche) : null,
            windowCount: null,
            floorCount: null,
            cleaningInterval: 'once',
            dirtLevel: 'normal',
            photoPaths: [],
            contactName,
            contactEmail,
            contactPhone,
            contactCompany: '',
            city,
            radius_km: 0,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.request_id) {
        setServerFehler(json.error ?? 'Anfrage konnte nicht angelegt werden.')
        return
      }

      await fetch('/api/update-request-notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: json.request_id, notes: baueNotizen() }),
      })

      await fetch('/api/update-aufmass-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: aufmass.id, status: 'uebernommen' }),
      })

      onUebernommen()
    } catch {
      setServerFehler('Netzwerkfehler. Bitte erneut versuchen.')
    } finally {
      setSpeichert(null)
    }
  }

  async function verwerfen() {
    setSpeichert('verwerfen')
    try {
      await fetch('/api/update-aufmass-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: aufmass.id, status: 'verworfen' }),
      })
      onVerworfen()
    } finally {
      setSpeichert(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Verstanden wurde</p>
        <p className="mt-1 text-sm text-gray-700">„{aufmass.transkript}"</p>
      </div>

      {s.unklar.length > 0 && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <p className="font-medium">Nicht sicher erkannt:</p>
          <ul className="mt-1 list-disc pl-4">
            {s.unklar.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Raum</label>
          <input
            value={raum}
            onChange={(e) => setRaum(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm outline-none ${leerFeldKlasse(!raum)}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Leistung *</label>
          <select
            value={leistungId}
            onChange={(e) => setLeistungId(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm outline-none ${leerFeldKlasse(!leistungId)}`}
          >
            <option value="">Bitte wählen…</option>
            {SERVICES.map((sv) => (
              <option key={sv.id} value={sv.id}>{sv.name}</option>
            ))}
          </select>
          {fehler.leistungId && <p className="text-xs text-red-500">{fehler.leistungId}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Fläche (m²)</label>
          <input
            type="number"
            value={flaeche}
            onChange={(e) => setFlaeche(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm outline-none ${leerFeldKlasse(!flaeche)}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Wandhöhe (m)</label>
          <input
            type="number"
            value={wandhoehe}
            onChange={(e) => setWandhoehe(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm outline-none ${leerFeldKlasse(!wandhoehe)}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Untergrund</label>
          <input
            value={untergrund}
            onChange={(e) => setUntergrund(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm outline-none ${leerFeldKlasse(!untergrund)}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Anstriche</label>
          <input
            type="number"
            value={anstriche}
            onChange={(e) => setAnstriche(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm outline-none ${leerFeldKlasse(!anstriche)}`}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={deckeInklusive}
          onChange={(e) => setDeckeInklusive(e.target.checked)}
          className="h-4 w-4 accent-blue-600"
        />
        Decke inklusive
      </label>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Kunde (für die Anfrage)</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Name *</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
            />
            {fehler.contactName && <p className="text-xs text-red-500">{fehler.contactName}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">E-Mail *</label>
            <input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
            />
            {fehler.contactEmail && <p className="text-xs text-red-500">{fehler.contactEmail}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Telefon *</label>
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
            />
            {fehler.contactPhone && <p className="text-xs text-red-500">{fehler.contactPhone}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Ort</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {serverFehler && <p className="text-sm text-red-600">{serverFehler}</p>}

      <div className="flex gap-2">
        <button
          onClick={verwerfen}
          disabled={speichert !== null}
          className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          Verwerfen
        </button>
        <button
          onClick={uebernehmen}
          disabled={speichert !== null}
          className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {speichert === 'uebernehmen' ? 'Übernimmt…' : 'Als Anfrage übernehmen'}
        </button>
      </div>
    </div>
  )
}
