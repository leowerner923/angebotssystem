'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Table } from '@/components/ui'
import type { RequestWithCustomer, RequestStatus } from '@/lib/types/database'
import { COMPANY_CONFIG } from '@/lib/company-config'

const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'Neu',
  contacted: 'Kontaktiert',
  closed: 'Abgeschlossen',
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-green-100 text-green-700',
}

const NEXT_STATUS: Record<RequestStatus, RequestStatus | null> = {
  new: 'contacted',
  contacted: 'closed',
  closed: null,
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function RequestsTable() {
  const router = useRouter()
  const [requests, setRequests] = useState<RequestWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [creatingOffer, setCreatingOffer] = useState<string | null>(null)
  const [noteValues, setNoteValues] = useState<Record<string, string>>({})
  const [savingNote, setSavingNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/get-requests?company_id=${COMPANY_CONFIG.id}`)
      const json = await res.json()
      if (!res.ok) {
        console.error('[RequestsTable] API Fehler:', res.status, json)
        setError(`API-Fehler ${res.status}: ${json.error ?? 'Unbekannter Fehler'}`)
        return
      }
      const loaded: RequestWithCustomer[] = json.requests ?? []
      console.log('[RequestsTable] Geladen:', loaded.length, 'Anfragen')
      setRequests(loaded)
      const initial: Record<string, string> = {}
      for (const r of loaded) initial[r.id] = r.notes ?? ''
      setNoteValues(initial)
    } catch (e) {
      console.error('[RequestsTable] Netzwerkfehler:', e)
      setError('Netzwerkfehler beim Laden der Anfragen.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreateOffer(requestId: string) {
    setCreatingOffer(requestId)
    try {
      const res = await fetch('/api/create-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId }),
      })
      if (res.ok) {
        router.push('/dashboard/angebote')
      } else {
        const err = await res.json().catch(() => ({}))
        console.error('Angebot erstellen fehlgeschlagen:', res.status, err)
      }
    } catch (e) {
      console.error('Netzwerkfehler beim Erstellen des Angebots:', e)
    } finally {
      setCreatingOffer(null)
    }
  }

  async function handleStatusChange(id: string, status: RequestStatus) {
    setUpdating(id)
    try {
      await fetch('/api/update-request-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    } finally {
      setUpdating(null)
    }
  }

  async function handleSaveNote(id: string) {
    setSavingNote(id)
    try {
      await fetch('/api/update-request-notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: noteValues[id] ?? '' }),
      })
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, notes: noteValues[id] ?? null } : r))
      )
    } finally {
      setSavingNote(null)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Kunde',
      render: (r: RequestWithCustomer) => (
        <div className="min-w-[140px]">
          <p className="font-medium text-gray-900">{r.customers?.name ?? '—'}</p>
          {r.customers?.company && (
            <p className="text-xs text-gray-400">{r.customers.company}</p>
          )}
          {r.customers?.email && (
            <a
              href={`mailto:${r.customers.email}`}
              className="text-xs text-blue-600 hover:underline"
            >
              {r.customers.email}
            </a>
          )}
          {r.customers?.phone && (
            <a
              href={`tel:${r.customers.phone}`}
              className="block text-xs text-gray-400 hover:text-gray-700"
            >
              {r.customers.phone}
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'service_type',
      header: 'Leistung',
      render: (r: RequestWithCustomer) => r.service_type ?? '—',
    },
    {
      key: 'square_meters',
      header: 'm²',
      render: (r: RequestWithCustomer) =>
        r.square_meters ? `${r.square_meters} m²` : '—',
    },
    {
      key: 'price',
      header: 'Schätzpreis',
      render: (r: RequestWithCustomer) =>
        `${(r.price ?? 0).toFixed(2).replace('.', ',')} €`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: RequestWithCustomer) => {
        const next = NEXT_STATUS[r.status]
        return (
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}
            >
              {STATUS_LABELS[r.status]}
            </span>
            {next && (
              <button
                onClick={() => handleStatusChange(r.id, next)}
                disabled={updating === r.id}
                className="cursor-pointer rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                → {STATUS_LABELS[next]}
              </button>
            )}
          </div>
        )
      },
    },
    {
      key: 'notes',
      header: 'Notiz',
      render: (r: RequestWithCustomer) => (
        <div className="flex min-w-[180px] flex-col gap-1">
          <textarea
            rows={2}
            value={noteValues[r.id] ?? ''}
            onChange={(e) =>
              setNoteValues((prev) => ({ ...prev, [r.id]: e.target.value }))
            }
            placeholder="Notiz hinzufügen…"
            className="w-full resize-none rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 outline-none transition-colors focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
          />
          <button
            onClick={() => handleSaveNote(r.id)}
            disabled={savingNote === r.id}
            className="cursor-pointer self-end rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            {savingNote === r.id ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Datum',
      render: (r: RequestWithCustomer) => formatDate(r.created_at),
    },
    {
      key: 'actions',
      header: '',
      render: (r: RequestWithCustomer) => (
        <button
          onClick={() => handleCreateOffer(r.id)}
          disabled={creatingOffer === r.id}
          className="cursor-pointer whitespace-nowrap rounded-lg border border-[var(--brand-primary)] px-3 py-1.5 text-xs font-medium text-[var(--brand-primary)] transition-colors hover:bg-blue-50 disabled:opacity-50"
        >
          {creatingOffer === r.id ? 'Wird erstellt…' : 'Angebot erstellen'}
        </button>
      ),
    },
  ]

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        <strong>Fehler beim Laden:</strong> {error}
      </div>
    )
  }

  return (
    <Table<RequestWithCustomer>
      columns={columns}
      data={requests}
      loading={loading}
      emptyMessage="Noch keine Anfragen vorhanden."
    />
  )
}
